import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import PlaceCard from '../components/PlaceCard';
import AddPlaceModal from '../components/AddPlaceModal';
import PlaceDetailModal from '../components/PlaceDetailModal';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/screens/home.styles';
import NotificationsModal from '../components/NotificationsModal';

const log = logger.scope('home');

type FilterType = 'all' | 'unvisited' | 'visited' | 'manual' | 'maps' | 'instagram';

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'unvisited', label: 'Not Visited' },
  { key: 'visited', label: 'Visited' },
  { key: 'manual', label: 'Manual' },
  { key: 'maps', label: 'Maps' },
  { key: 'instagram', label: 'Instagram' },
];

function HomeContent() {
  const insets = useSafeAreaInsets();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const [profile, setProfile] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [places, setPlaces] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // ── Realtime & Refresh logic ───────────────────────────────────────────────────

  const fetchUnreadCount = useCallback(async (userId: string) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('recipient_id', userId)
      .eq('is_read', false);
    
    if (!error) setUnreadCount(count || 0);
  }, []);

  useEffect(() => {
    if (!profile?.id) return;
    fetchUnreadCount(profile.id);

    // Subscribe to places and notifications
    const placesChannel = supabase
      .channel('places-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'places',
        filter: `couple_id=eq.${profile.couple_id}`
      }, (payload) => {
        log.info('Realtime PLACE insert received', payload.new);
        setPlaces(prev => {
          if (prev.find(p => p.id === (payload.new as any).id)) return prev;
          return [payload.new as any, ...prev];
        });
      })
      .subscribe();

    const notificationsChannel = supabase
      .channel('notifications-realtime')
      .on('postgres_changes', {
        event: '*', // Listen for all to refresh count
        schema: 'public',
        table: 'notifications',
        filter: `recipient_id=eq.${profile.id}`
      }, () => {
        log.info('Realtime NOTIFICATION change received');
        fetchUnreadCount(profile.id);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(placesChannel);
      supabase.removeChannel(notificationsChannel);
    };
  }, [profile?.id, profile?.couple_id, fetchUnreadCount]);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: profiles, error: pError } = await supabase
        .from('profiles')
        .select('*');

      if (pError) throw pError;

      const myProfile = profiles.find(p => p.id === session.user.id);
      setProfile(myProfile);

      if (myProfile?.couple_id) {
        const partnerProfile = profiles.find(p => p.couple_id === myProfile.couple_id && p.id !== myProfile.id);
        setPartner(partnerProfile);

        const { data: placesData, error: plError } = await supabase
          .from('places')
          .select('*')
          .eq('couple_id', myProfile.couple_id)
          .order('created_at', { ascending: false });

        if (plError) throw plError;
        setPlaces(placesData);
        
        // Also refresh unread count
        fetchUnreadCount(myProfile.id);
      }
    } catch (err) {
      log.error('Load data failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetchUnreadCount]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filter logic ─────────────────────────────────────────────────────────────

  const filteredPlaces = useMemo(() => {
    switch (activeFilter) {
      case 'unvisited': return places.filter(p => !p.visited);
      case 'visited': return places.filter(p => p.visited);
      case 'manual': return places.filter(p => p.source === 'manual');
      case 'maps': return places.filter(p => p.source === 'maps');
      case 'instagram': return places.filter(p => p.source === 'instagram');
      default: return places;
    }
  }, [places, activeFilter]);

  // ── Render Helpers ─────────────────────────────────────────────────────────────

  const renderEmptyState = () => {
    let title = "No places saved yet. Tap + to add your first one!";
    if (activeFilter === 'unvisited') title = "No unvisited places!";
    if (activeFilter === 'visited') title = "No visited places yet!";
    if (activeFilter === 'manual') title = "No manual entries found.";
    if (activeFilter === 'maps') title = "No map links found.";
    if (activeFilter === 'instagram') title = "No instagram places found.";

    return (
      <View style={styles.emptyContainer}>
        <Text style={{ fontSize: 40 }}>🍽️</Text>
        <Text style={styles.emptyTitle}>{title}</Text>
      </View>
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => supabase.auth.signOut() }
    ]);
  };

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.background }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.main, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>OurTable</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.7} 
            onPress={() => setNotificationsModalVisible(true)}
          >
            <Text style={{ fontSize: 18 }}>🔔</Text>
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={toggleTheme}>
            <Text style={{ fontSize: 18 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7} onPress={handleSignOut}>
            <Text style={{ fontSize: 18 }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {FILTERS.map((f) => {
            const isActive = activeFilter === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                onPress={() => setActiveFilter(f.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Places List */}
      <FlatList
        data={filteredPlaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlaceCard
            place={item}
            partnerName={partner?.full_name}
            currentUserId={profile?.id}
            onPress={() => {
              setSelectedPlace(item);
              setDetailModalVisible(true);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        ListEmptyComponent={renderEmptyState()}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>

      {/* Modals */}
      {profile?.couple_id && (
        <AddPlaceModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSaved={() => {
            // loadData(true) is mostly covered by realtime now, but still safe to call if needed
            setAddModalVisible(false);
          }}
          coupleId={profile.couple_id}
          userId={profile.id}
        />
      )}

      {profile && (
        <NotificationsModal
          visible={notificationsModalVisible}
          onClose={() => setNotificationsModalVisible(false)}
          currentUserId={profile.id}
          onNotificationUpdate={() => fetchUnreadCount(profile.id)}
        />
      )}

      {selectedPlace && (
        <PlaceDetailModal
          visible={detailModalVisible}
          place={selectedPlace}
          partnerName={partner?.full_name}
          currentUserId={profile?.id}
          onClose={() => setDetailModalVisible(false)}
          onUpdate={(updated) => {
            if (updated) {
              setPlaces(prev => prev.map(p => p.id === updated.id ? updated : p));
              setSelectedPlace(updated);
            }
          }}
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
