import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { supabase } from '../lib/supabase';
import { layoutLog } from '../lib/logger';
import styles from '../styles/screens/layout.styles';
import type { Session } from '@supabase/supabase-js';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      layoutLog.info('Initial session', { userId: session?.user?.id ?? null });
      setSession(session);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      layoutLog.info('Auth state changed', { event, userId: session?.user?.id ?? null });
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Wait until session state is resolved (not undefined)
    if (session === undefined) return;

    const seg = segments as string[];
    const inAuthGroup = seg[0] === '(auth)';
    const onCoupleScreen = seg[1] === 'couple';

    if (!session && !inAuthGroup) {
      layoutLog.info('No session — redirecting to login');
      router.replace('/(auth)/login');
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
  }, [session, segments]);

  return (
    <View style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
    </View>
  );
}
