const { withAndroidManifest, withMainActivity } = require('@expo/config-plugins');

/**
 * Converts an incoming Android SEND intent into an ourtable:// deep link
 * so expo-linking can read it from JS via getInitialURL / addEventListener.
 *
 * This works by modifying the intent IN PLACE before super.onCreate() runs,
 * which is the point where React Native reads the initial URL from the intent.
 *
 * Requires a new native build — does NOT work with npx expo start alone.
 */

const HANDLE_SEND_METHOD = `
  private fun handleSendIntent(intent: android.content.Intent?) {
    if (intent == null) return
    if (intent.action == android.content.Intent.ACTION_SEND && intent.type == "text/plain") {
      val sharedText = intent.getStringExtra(android.content.Intent.EXTRA_TEXT) ?: return
      val encoded = android.net.Uri.encode(sharedText)
      intent.action = android.content.Intent.ACTION_VIEW
      intent.data = android.net.Uri.parse("ourtable://share?shared=\$encoded")
      setIntent(intent)
    }
  }
`;

const ON_NEW_INTENT_OVERRIDE = `
  override fun onNewIntent(intent: android.content.Intent?) {
    handleSendIntent(intent)
    super.onNewIntent(intent)
  }
`;

module.exports = function withAndroidShareIntent(config) {
  // ── Step 1: Add SEND intent-filter to AndroidManifest ──────────────────────
  config = withAndroidManifest(config, (config) => {
    const mainActivity = config.modResults.manifest.application[0].activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );
    if (!mainActivity) return config;

    if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];

    const alreadyAdded = mainActivity['intent-filter'].some((f) =>
      f.action?.some((a) => a.$['android:name'] === 'android.intent.action.SEND')
    );

    if (!alreadyAdded) {
      mainActivity['intent-filter'].push({
        action: [{ $: { 'android:name': 'android.intent.action.SEND' } }],
        category: [{ $: { 'android:name': 'android.intent.category.DEFAULT' } }],
        data: [{ $: { 'android:mimeType': 'text/plain' } }],
      });
    }
    return config;
  });

  // ── Step 2: Inject Kotlin into MainActivity to convert SEND → deep link ────
  config = withMainActivity(config, (config) => {
    let src = config.modResults.contents;

    // --- Inject handleSendIntent call in onCreate ---
    // Call it before SplashScreenManager (which is before super.onCreate)
    // This ensures the intent is modified before React Native reads getInitialURL()
    if (!src.includes('handleSendIntent(intent)')) {
      // Try anchoring on SplashScreenManager first
      if (src.includes('SplashScreenManager.registerOnActivity(this)')) {
        src = src.replace(
          'SplashScreenManager.registerOnActivity(this)',
          'handleSendIntent(intent)\n    SplashScreenManager.registerOnActivity(this)'
        );
      } else if (src.includes('super.onCreate(savedInstanceState)')) {
        // Fallback: inject before super.onCreate
        src = src.replace(
          'super.onCreate(savedInstanceState)',
          'handleSendIntent(intent)\n    super.onCreate(savedInstanceState)'
        );
      }
    }

    // --- Add onNewIntent override (handles share while app is backgrounded) ---
    if (!src.includes('onNewIntent')) {
      src = src.replace(
        'override fun getMainComponentName',
        `${ON_NEW_INTENT_OVERRIDE}\n  override fun getMainComponentName`
      );
    }

    // --- Add the handleSendIntent helper method before the last closing brace ---
    if (!src.includes('private fun handleSendIntent')) {
      src = src.replace(/}\s*$/, `${HANDLE_SEND_METHOD}\n}`);
    }

    config.modResults.contents = src;
    return config;
  });

  return config;
};
