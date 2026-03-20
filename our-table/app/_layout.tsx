import { useEffect, useState, useRef } from 'react';
import { View, LogBox } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Ignore the SDK 53+ Expo Go push notification warning as it is expected for this dev environment
LogBox.ignoreLogs(['expo-notifications: Android Push notifications']);
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { layoutLog } from '../lib/logger';
import { createStyles } from '../styles/screens/layout.styles';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import type { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { registerForPushNotifications, savePushToken } from '../lib/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

function AppContent() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();
  const { theme, isDark, isLoaded } = useTheme();
  const styles = createStyles(theme);

  const isMounted = useRef(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!isMounted.current) return;
      layoutLog.info('Initial session', { userId: session?.user?.id ?? null });
      setSession(session);
    });

    AsyncStorage.getItem('ourtable_onboarding_complete').then((val) => {
      if (isMounted.current) setHasSeenOnboarding(val === 'true');
      console.log('onboarding complete:', hasSeenOnboarding)
    });

    console.log('session:', session)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted.current) return;
      layoutLog.info('Auth state changed', { event, userId: session?.user?.id ?? null });
      setSession(session);
    });

    return () => {
      isMounted.current = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session !== undefined && isLoaded && hasSeenOnboarding !== undefined) {
      SplashScreen.hideAsync();
    }
  }, [session, isLoaded, hasSeenOnboarding]);

  useEffect(() => {
    if (session === undefined || hasSeenOnboarding === undefined) return;

    const seg = segments as string[];
    const inAuthGroup = seg[0] === '(auth)';
    const inOnboarding = seg[0] === '(onboarding)';
    const onCoupleScreen = seg[1] === 'couple';
    const onLoginOrRegister = seg[1] === 'login' || seg[1] === 'register';

    // Mark onboarding complete once they reach login/register
    if (inAuthGroup && onLoginOrRegister && !hasSeenOnboarding) {
      AsyncStorage.setItem('ourtable_onboarding_complete', 'true');
      setHasSeenOnboarding(true);
    }

    if (!session) {
      if (!hasSeenOnboarding && !inOnboarding) {
        layoutLog.info('First launch — showing onboarding');
        router.replace('/(onboarding)');
        return;
      }
      if (hasSeenOnboarding && !inAuthGroup) {
        layoutLog.info('No session — redirecting to login');
        router.replace('/(auth)/login');
        return;
      }
      return;
    }

    if (session && inAuthGroup && !onCoupleScreen) {
      layoutLog.info('Session found on auth screen — fetching profile', { userId: session.user.id });
      supabase
        .from('profiles')
        .select('couple_id')
        .eq('id', session.user.id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            layoutLog.error('Profile fetch failed', error);
            return;
          }
          layoutLog.info('Profile fetched', { couple_id: data?.couple_id ?? null });
          if (data?.couple_id) {
            layoutLog.info('couple_id found — redirecting home');
            router.replace('/');
          } else {
            layoutLog.info('No couple_id — redirecting to couple setup');
            router.replace('/(auth)/couple');
          }
        });
    }
  }, [session, segments, hasSeenOnboarding]);

  // Push Notifications Setup
  useEffect(() => {
    if (!session?.user?.id) return;

    // 1. Initial Registration
    registerForPushNotifications().then(token => {
      if (token && session.user.id) {
        savePushToken(session.user.id, token);
        layoutLog.info('Push token saved', { token });
      }
    });

    // 2. Received (foreground)
    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      layoutLog.info('Notification received', notification);
    });

    // 3. Responded (tapped)
    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      layoutLog.info('Notification response received', response);
      // Navigation can be handled here later
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [session]);

  return (
    <View style={styles.root}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="(onboarding)/index" options={{ animation: 'fade', contentStyle: { backgroundColor: '#0D0D0D' } }} />
        <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)/register" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)/couple" options={{ animation: 'fade' }} />
      </Stack>
      <Toast />
    </View>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
