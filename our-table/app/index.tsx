import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import PlaceCard from '../components/PlaceCard';
import AddPlaceModal from '../components/AddPlaceModal';
import { colors } from '../constants/styles';
import styles from '../styles/screens/home.styles';
import type { Place, Profile } from '../types';

const log = logger.scope('home');

function HomeContent() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile]       = useState<Profile | null>(null);
  const [places, setPlaces]         = useState<Place[]>([]);
  const [loading, setLoading]       = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const fetchProfile = async (): Promise<Profile | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) { log.error('Profile fetch failed', error); return null; }
    log.info('Profile loaded', { coupleId: data.couple_id });
    return data as Profile;
  };

  const fetchPlaces = async (coupleId: string): Promise<Place[]> => {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('couple_id', coupleId)
      .order('created_at', { ascending: false });

    if (error) { log.error('Places fetch failed', error); return []; }
    log.info('Places loaded', { count: data.length });
    return data as Place[];
  };

  const load = useCallback(async () => {
    setLoading(true);
    const p = await fetchProfile();
    setProfile(p);
    if (p?.couple_id) {
      setPlaces(await fetchPlaces(p.couple_id));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleSignOut = async () => {
    log.info('Signing out');
    await supabase.auth.signOut();
    // _layout.tsx handles the redirect automatically
  };

  const handleSaved = () => {
    setModalVisible(false);
    load(); // refresh the list
  };

  // ── Loading state ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.main, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>OurTable 🍽️</Text>
          <Text style={styles.headerSubtitle}>Your shared wishlist</Text>
        </View>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </View>

      {/* ── Places list ── */}
      <FlatList
        data={places}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <PlaceCard place={item} />}
        contentContainerStyle={[
          styles.listContent,
          places.length === 0 && styles.listEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🗺️</Text>
            <Text style={styles.emptyTitle}>No places saved yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the{' '}
              <Text style={styles.highlightText}>+</Text>
              {' '}button to add your first restaurant!
            </Text>
          </View>
        }
      />

      {/* ── Floating action button ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* ── Add Place Modal ── */}
      {profile?.couple_id && (
        <AddPlaceModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onSaved={handleSaved}
          coupleId={profile.couple_id}
          userId={profile.id}
        />
      )}
    </View>
  );
}

export default function HomeScreen() {
  return (
    <SafeAreaProvider>
      <HomeContent />
    </SafeAreaProvider>
  );
}


