import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import { logger } from '../lib/logger';

const log = logger.scope('share-intent');

/**
 * Detects when OurTable is opened via the Android share sheet.
 * Works because our config plugin (withAndroidShareIntent.js) converts
 * incoming SEND intents into ourtable://share?shared=<encoded-url> deep links
 * inside MainActivity.kt before React Native reads the initial URL.
 *
 * NOTE: Share sheet only works in dev/production builds — NOT in Expo Go.
 * The flow is: Share sheet → MainActivity.handleSendIntent() → deep link → here.
 */
export function useShareIntent(onSharedContent: (text: string) => void) {
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    // ── Case 1: App opened fresh via share intent ──────────────────────────
    Linking.getInitialURL().then((url) => {
      if (url) {
        log.info('Initial URL received', { url });
        handleDeepLink(url, onSharedContent);
      }
    }).catch((err) => {
      log.error('getInitialURL failed', err);
    });

    // ── Case 2: App already running, user shares while in background ───────
    const subscription = Linking.addEventListener('url', (event) => {
      log.info('Foreground URL event received', { url: event.url });
      handleDeepLink(event.url, onSharedContent);
    });

    return () => subscription.remove();
  }, []);
}

function handleDeepLink(url: string, cb: (text: string) => void) {
  if (!url) return;
  try {
    const parsed = Linking.parse(url);
    log.debug('Deep link parsed', { hostname: parsed.hostname, path: parsed.path, params: parsed.queryParams });
    // Our deep link format: ourtable://share?shared=<encoded-text>
    if (parsed.hostname === 'share' || parsed.path === 'share') {
      const shared = parsed.queryParams?.shared;
      if (shared && typeof shared === 'string') {
        const decoded = decodeURIComponent(shared);
        log.info('Share intent matched — forwarding to modal', { sharedContent: decoded.slice(0, 80) });
        cb(decoded);
      } else {
        log.warn('Share deep link matched but no shared param found', { params: parsed.queryParams });
      }
    }
  } catch (err) {
    log.error('Failed to parse deep link URL', { url, err });
  }
}
