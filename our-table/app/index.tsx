import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import PlaceCard from '../components/PlaceCard';
import AddPlaceModal from '../components/AddPlaceModal';
import PlaceDetailModal from '../components/PlaceDetailModal';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/screens/home.styles';
import NotificationsModal from '../components/NotificationsModal';
import SkeletonCard from '../components/SkeletonCard';
import CustomAlert from '../components/CustomAlert';
import { toast } from '../lib/toast';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

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
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const router = useRouter();

  // Modal states
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [notificationsModalVisible, setNotificationsModalVisible] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean; title: string; message: string; isDestructive?: boolean;
    confirmText?: string; iconName?: keyof typeof Ionicons.glyphMap; onConfirm: () => void;
  }>({ visible: false, title: '', message: '', onConfirm: () => { } });

  // FAB Animation
  const fabScale = useSharedValue(1);
  const fabRotation = useSharedValue(0);

  useEffect(() => {
    fabRotation.value = withSpring(addModalVisible ? 45 : 0);
  }, [addModalVisible]);

  const fabAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: fabScale.value },
      { rotate: `${fabRotation.value}deg` }
    ],
  }));

  const handleFabPressIn = () => {
    fabScale.value = withSpring(0.88);
  };
  const handleFabPressOut = () => {
    fabScale.value = withSpring(1.0);
  };

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
        toast.info(`New place from ${partner?.full_name || 'partner'}!`);
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
  }, [profile?.id, profile?.couple_id, fetchUnreadCount, partner?.full_name]);

  // ── Data fetching ────────────────────────────────────────────────────────────

  const loadData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setUserEmail(session.user.email ?? null);

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

  // ── Actions ─────────────────────────────────────────────────────────────

  const handleDelete = (place: any) => {
    setAlertConfig({
      visible: true,
      title: 'Remove Place',
      message: `Are you sure you want to remove "${place.name}"? This cannot be undone.`,
      isDestructive: true,
      confirmText: 'Remove',
      iconName: 'trash-outline',
      onConfirm: async () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        // Optimistic Update
        const originalPlaces = [...places];
        setPlaces(prev => prev.filter(p => p.id !== place.id));

        const { error } = await supabase.from('places').delete().eq('id', place.id);
        if (error) {
          setPlaces(originalPlaces);
          toast.error(`Failed to delete: ${error.message}`);
        } else {
          toast.success('Place removed from list');
        }
      }
    });
  };

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
    const config = {
      all: { icon: 'restaurant-outline' as const, title: 'No places saved yet', sub: 'Tap the + button to add your first spot!' },
      unvisited: { icon: 'sparkles-outline' as const, title: 'All caught up!', sub: 'No unvisited places left!' },
      visited: { icon: 'trophy-outline' as const, title: 'Nothing visited yet', sub: 'Go explore and mark places done!' },
      manual: { icon: 'create-outline' as const, title: 'No manual entries', sub: 'Add a place by typing it in!' },
      maps: { icon: 'map-outline' as const, title: 'No map searches yet', sub: 'Search for a place to get started!' },
      instagram: { icon: 'camera-outline' as const, title: 'No Instagram places', sub: 'Save spots from Instagram here!' },
    };

    const { icon, title, sub } = config[activeFilter] || config.all;

    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyCard}>
          <Ionicons name={icon} size={64} color={theme.colors.textHint} />
          <Text style={styles.emptyTitle}>{title}</Text>
          <Text style={styles.emptySubtitle}>{sub}</Text>
        </View>
      </View>
    );
  };

  const handleSignOut = () => {
    setMenuOpen(false);
    setAlertConfig({
      visible: true,
      title: 'Sign Out',
      message: 'Are you sure you want to sign out?',
      isDestructive: true,
      confirmText: 'Sign Out',
      iconName: 'log-out-outline',
      onConfirm: () => {
        setAlertConfig(prev => ({ ...prev, visible: false }));
        supabase.auth.signOut();
        toast.info('Signed out');
      }
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.main, { paddingTop: insets.top }]}>
        <View style={styles.header}><Text style={styles.headerTitle}>OurTable</Text></View>
        <ScrollView contentContainerStyle={styles.listContent}>{[1, 2, 3, 4].map(i => <SkeletonCard key={`sk-${i}`} />)}</ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.main, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flex: 1, alignItems: 'flex-start' }}>
          {profile?.full_name && (
            <Text style={{ fontSize: 13, color: theme.colors.textSecondary, fontWeight: '500' }}>
              Welcome,{"\n"}<Text style={{ fontSize: 15, color: theme.colors.text, fontWeight: 'bold' }}>{profile.full_name}</Text>
            </Text>
          )}
        </View>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { fontFamily: Platform.OS === 'ios' ? 'Snell Roundhand' : 'cursive', fontStyle: 'italic', fontWeight: 'bold', fontSize: 32 }]}>
            OurTable
          </Text>
        </View>

        <View style={{ flex: 1, alignItems: 'flex-end', zIndex: 10 }}>
          <TouchableOpacity
            style={styles.iconButton}
            activeOpacity={0.7}
            onPress={() => setMenuOpen(!menuOpen)}
          >
            <Ionicons name="menu" size={24} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Expandable Menu */}
      {menuOpen && (
        <View style={{
          position: 'absolute',
          top: insets.top + (Platform.OS === 'ios' ? 70 : 80),
          right: 20,
          backgroundColor: theme.colors.card,
          borderRadius: 16,
          padding: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
          zIndex: 100,
          minWidth: 160,
        }}>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
            onPress={() => {
              setMenuOpen(false);
              setNotificationsModalVisible(true);
            }}
          >
            <Ionicons name="notifications-outline" size={20} color={theme.colors.text} />
            <Text style={{ marginLeft: 12, color: theme.colors.text, fontSize: 15, fontWeight: '500' }}>Notifications</Text>
            {unreadCount > 0 && <View style={{ marginLeft: 'auto', backgroundColor: theme.colors.primary, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 }}><Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{unreadCount}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
            onPress={() => {
              setMenuOpen(false);
              toggleTheme();
            }}
          >
            <Ionicons name={isDark ? "sunny-outline" : "moon-outline"} size={20} color={theme.colors.text} />
            <Text style={{ marginLeft: 12, color: theme.colors.text, fontSize: 15, fontWeight: '500' }}>{isDark ? 'Light' : 'Dark'} Mode</Text>
          </TouchableOpacity>
          {userEmail === 'chohanhasnain24@gmail.com' || userEmail === 'testsubject1@mailinator.com' && (
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}
              onPress={() => {
                setMenuOpen(false);
                router.push('/logs');
              }}
            >
              <Ionicons name="terminal-outline" size={20} color={theme.colors.text} />
              <Text style={{ marginLeft: 12, color: theme.colors.text, fontSize: 15, fontWeight: '500' }}>Developer Logs</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
            <Text style={{ marginLeft: 12, color: theme.colors.error, fontSize: 15, fontWeight: '500' }}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      )}

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
            onDelete={() => handleDelete(item)}
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
            title="Refreshing..."
            titleColor={theme.colors.textSecondary}
            progressBackgroundColor={theme.colors.card}
          />
        }
        ListEmptyComponent={renderEmptyState()}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddModalVisible(true)}
        onPressIn={handleFabPressIn}
        onPressOut={handleFabPressOut}
        activeOpacity={1}
        style={styles.fabContainer}
      >
        <Animated.View style={[styles.fab, fabAnimatedStyle]}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Animated.View>
      </TouchableOpacity>

      {/* Modals */}
      {profile?.couple_id && (
        <AddPlaceModal
          visible={addModalVisible}
          onClose={() => setAddModalVisible(false)}
          onSaved={(newPlace) => {
            setAddModalVisible(false);
            setPlaces(prev => {
              if (prev.find(p => p.id === newPlace.id)) return prev;
              return [newPlace, ...prev];
            });
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onCancel={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
        onConfirm={alertConfig.onConfirm}
        isDestructive={alertConfig.isDestructive}
        confirmText={alertConfig.confirmText}
        iconName={alertConfig.iconName}
      />
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
