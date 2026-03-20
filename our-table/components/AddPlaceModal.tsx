import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/addPlaceModal.styles';
import { sendPushNotification } from '../lib/notifications';

import { Ionicons } from '@expo/vector-icons';
import { toast } from '../lib/toast';

const log = logger.scope('add-place');

type Tab = 'manual' | 'search' | 'maps_link' | 'instagram';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: (place: any) => void;
  coupleId: string;
  userId: string;
  initialUrl?: string | null;
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'manual',    label: 'Manual'   },
  { key: 'search',    label: 'Search'   },
  { key: 'maps_link', label: 'Map Link' },
  { key: 'instagram', label: 'Instagram'},
];

export default function AddPlaceModal({ visible, onClose, onSaved, coupleId, userId, initialUrl }: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [loading, setLoading]     = useState(false);

  // Manual tab
  const [manualName,    setManualName]    = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNotes,   setManualNotes]   = useState('');

  // Search tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<{
    name: string;
    address: string;
    lat: number;
    lon: number;
  } | null>(null);
  const [searchNotes, setSearchNotes] = useState('');

  // Map Link tab
  const [mapLinkUrl,   setMapLinkUrl]   = useState('');
  const [mapLinkName,  setMapLinkName]  = useState('');
  const [mapLinkNotes, setMapLinkNotes] = useState('');

  // Instagram tab
  const [igUrl,   setIgUrl]   = useState('');
  const [igName,  setIgName]  = useState('');
  const [igNotes, setIgNotes] = useState('');

  // Fetch user location for search biasing (City/Country prioritization)
  useEffect(() => {
    if (activeTab === 'search' && (!userLocation || !userCountry)) {
      (async () => {
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') return;

          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          
          setUserLocation({
            lat: location.coords.latitude,
            lon: location.coords.longitude,
          });

          const geocode = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });

          if (geocode.length > 0 && geocode[0].isoCountryCode) {
            setUserCountry(geocode[0].isoCountryCode.toLowerCase());
          }
          
          log.info('User region detected for localized search');
        } catch (err) {
          log.error('Failed to get user region', err);
        }
      })();
    }
  }, [activeTab]);

  // Debounced search for Nominatim
  useEffect(() => {
    if (activeTab !== 'search' || !searchQuery.trim() || searchQuery.length < 3) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        log.info('Searching Nominatim', { 
          query: searchQuery, 
          biased: !!userLocation,
          country: userCountry 
        });

        let url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=15&accept-language=en`;
        
        if (userLocation) {
          const delta = 0.2;
          const lon1 = userLocation.lon - delta;
          const lat1 = userLocation.lat + delta;
          const lon2 = userLocation.lon + delta;
          const lat2 = userLocation.lat - delta;
          url += `&viewbox=${lon1},${lat1},${lon2},${lat2}&bounded=0`;
        }

        if (userCountry) {
          url += `&countrycodes=${userCountry}`;
        }

        const response = await fetch(url, {
          headers: { 'User-Agent': 'OurTable/1.0' }
        });
        const data = await response.json();
        setSearchResults(data);
      } catch (err) {
        log.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, activeTab, userLocation, userCountry]);

  const resetAll = () => {
    setManualName(''); setManualAddress(''); setManualNotes('');
    setSearchQuery(''); setSearchResults([]); setSelectedPlace(null); setSearchNotes('');
    setMapLinkUrl(''); setMapLinkName(''); setMapLinkNotes('');
    setIgUrl(''); setIgName(''); setIgNotes('');
    setActiveTab('manual');
    setLoading(false);
    setIsSearching(false);
  };

  // Auto-route when a URL is shared from another app
  useEffect(() => {
    if (!visible || !initialUrl) return;
    const url = initialUrl.trim();
    if (url.includes('instagram.com')) {
      setActiveTab('instagram');
      setIgUrl(url);
    } else if (
      url.includes('google.com/maps') ||
      url.includes('maps.app.goo.gl') ||
      url.includes('maps.google')
    ) {
      setActiveTab('maps_link');
      setMapLinkUrl(url);
    } else {
      // Unknown URL — default to map link tab, let user fill name
      setActiveTab('maps_link');
      setMapLinkUrl(url);
    }
  }, [visible, initialUrl]);

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const selectPlaceFromSearch = (item: any) => {
    const rawName = item.name || item.display_name.split(',')[0];
    const place = {
      name: rawName,
      address: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
    };
    setSelectedPlace(place);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleSave = async () => {
    let payload: Record<string, unknown> = {
      couple_id: coupleId,
      added_by:  userId,
    };

    if (activeTab === 'manual') {
      if (!manualName.trim()) {
        toast.error('Place name is required');
        return;
      }
      payload = {
        ...payload,
        source:  'manual',
        name:    manualName.trim(),
        address: manualAddress.trim() || null,
        notes:   manualNotes.trim()   || null,
      };

    } else if (activeTab === 'search') {
      if (!selectedPlace) {
        toast.error('Please search and select a place');
        return;
      }
      payload = {
        ...payload,
        source:    'maps',
        name:      selectedPlace.name,
        address:   selectedPlace.address,
        latitude:  selectedPlace.lat,
        longitude: selectedPlace.lon,
        notes:     searchNotes.trim() || null,
      };

    } else if (activeTab === 'maps_link') {
      if (!mapLinkUrl.trim()) {
        toast.error('Maps link URL is required');
        return;
      }
      if (!mapLinkName.trim()) {
        toast.error('Place name is required');
        return;
      }
      payload = {
        ...payload,
        source:   'maps',
        name:     mapLinkName.trim(),
        maps_url: mapLinkUrl.trim(),
        notes:    mapLinkNotes.trim() || null,
      };

    } else if (activeTab === 'instagram') {
      if (!igName.trim()) {
        toast.error('Place name is required');
        return;
      }
      payload = {
        ...payload,
        source: 'instagram',
        name:   igName.trim(),
        url:    igUrl.trim() || null,
        notes:  igNotes.trim() || null,
      };
    }

    setLoading(true);
    try {
      log.info('Saving place', { source: activeTab, name: payload.name });
      const { data: savedPlace, error } = await supabase
        .from('places')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      log.info('Place saved', { name: payload.name });

      // Notify Partner
      try {
         const { data: partner } = await supabase
            .from('profiles')
            .select('id, expo_push_token, full_name')
            .eq('couple_id', coupleId)
            .neq('id', userId)
            .single();

         const { data: me } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', userId)
            .single();

         if (partner) {
            const myName = me?.full_name || 'Your partner';
            const placeName = payload.name as string;

            // 1. Send Push
            if (partner.expo_push_token) {
               await sendPushNotification(
                  partner.expo_push_token,
                  "New place added!",
                  `${myName} saved ${placeName}`
               );
            }

            // 2. Insert Notification Record
            await supabase.from('notifications').insert({
               couple_id: coupleId,
               recipient_id: partner.id,
               sender_id: userId,
               place_id: savedPlace.id,
               message: `${myName} saved ${placeName} to your list`
            });
         }
      } catch (notifyErr) {
         log.error('Partner notification failed', notifyErr);
      }

      resetAll();
      onSaved(savedPlace);
      toast.success('Place saved to your list!');
    } catch (err: any) {
      log.error('Save failed', err);
      toast.error(err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add a Place</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {/* Tab bar */}
          <View style={styles.tabBar}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {TABS.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, { minWidth: 100 }]}
                  onPress={() => setActiveTab(tab.key)}
                >
                  <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                    {tab.label}
                  </Text>
                  {activeTab === tab.key && <View style={styles.tabUnderline} />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Tab content */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Share intent banner */}
            {!!initialUrl && (
              <View style={{
                backgroundColor: theme.colors.backgroundSecondary,
                borderRadius: theme.borderRadius.md,
                padding: theme.spacing.md,
                marginBottom: theme.spacing.md,
                borderLeftWidth: 3,
                borderLeftColor: theme.colors.brandGold,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="share-social-outline" size={16} color={theme.colors.brandGold} style={{ marginRight: 8 }} />
                <Text style={{ ...theme.typography.small, color: theme.colors.textSecondary, flex: 1 }}>
                  Shared from another app — URL pre-filled below. Add a name and save!
                </Text>
              </View>
            )}
            {/* Manual */}
            {activeTab === 'manual' && (
              <>
                <Text style={styles.label}>Place Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nobu Restaurant"
                  placeholderTextColor={theme.colors.placeholder}
                  value={manualName}
                  onChangeText={setManualName}
                />
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 105 Hudson St, New York"
                  placeholderTextColor={theme.colors.placeholder}
                  value={manualAddress}
                  onChangeText={setManualAddress}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="e.g. Saw it on TikTok, want to try the tasting menu"
                  placeholderTextColor={theme.colors.placeholder}
                  multiline
                  numberOfLines={4}
                  value={manualNotes}
                  onChangeText={setManualNotes}
                />
              </>
            )}

            {/* Search */}
            {activeTab === 'search' && (
              <>
                <Text style={styles.label}>Search Place *</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { flex: 1, marginBottom: 0 }]}
                    placeholder="Search for a restaurant or bar..."
                    placeholderTextColor={theme.colors.placeholder}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {isSearching && (
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary}
                      style={{ position: 'absolute', right: 12 }}
                    />
                  )}
                </View>

                {/* Results List */}
                {searchResults.length > 0 && (
                  <View style={styles.resultsList}>
                    <ScrollView
                      keyboardShouldPersistTaps="always"
                      nestedScrollEnabled
                      style={{ maxHeight: 210 }}
                    >
                      {searchResults.map((item, idx) => (
                        <TouchableOpacity
                          key={idx}
                          style={styles.resultItem}
                          onPress={() => selectPlaceFromSearch(item)}
                        >
                          <Text style={styles.resultName} numberOfLines={1}>
                            {item.name || item.display_name.split(',')[0]}
                          </Text>
                          <Text style={styles.resultAddress} numberOfLines={1}>
                            {item.display_name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {!isSearching && searchQuery.length >= 3 && searchResults.length === 0 && !selectedPlace && (
                  <Text style={styles.emptyText}>No places found. Try a different search.</Text>
                )}

                {/* Selected Place Card */}
                {selectedPlace && (
                  <View style={styles.selectedCard}>
                    <View style={styles.selectedCardInfo}>
                      <Text style={styles.selectedCardName} numberOfLines={1}>
                        {selectedPlace.name}
                      </Text>
                      <Text style={styles.selectedCardAddress} numberOfLines={1}>
                        {selectedPlace.address}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.clearSelection}
                      onPress={() => setSelectedPlace(null)}
                    >
                      <Ionicons name="close" size={20} color={theme.colors.text} />
                    </TouchableOpacity>
                  </View>
                )}

                <Text style={[styles.label, { marginTop: theme.spacing.lg }]}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Add secret tips or why you want to go..."
                  placeholderTextColor={theme.colors.placeholder}
                  multiline
                  numberOfLines={4}
                  value={searchNotes}
                  onChangeText={setSearchNotes}
                />
              </>
            )}

            {/* Map Link */}
            {activeTab === 'maps_link' && (
              <>
                <Text style={styles.label}>Map URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Paste Google Maps link here"
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={mapLinkUrl}
                  onChangeText={setMapLinkUrl}
                />
                <Text style={styles.label}>Place Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Central Park"
                  placeholderTextColor={theme.colors.placeholder}
                  value={mapLinkName}
                  onChangeText={setMapLinkName}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Any notes about this place..."
                  placeholderTextColor={theme.colors.placeholder}
                  multiline
                  numberOfLines={4}
                  value={mapLinkNotes}
                  onChangeText={setMapLinkNotes}
                />
              </>
            )}

            {/* Instagram */}
            {activeTab === 'instagram' && (
              <>
                <Text style={styles.label}>Instagram Post URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.instagram.com/p/..."
                  placeholderTextColor={theme.colors.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={igUrl}
                  onChangeText={setIgUrl}
                />
                <Text style={styles.label}>Place Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. The NoMad Restaurant"
                  placeholderTextColor={theme.colors.placeholder}
                  value={igName}
                  onChangeText={setIgName}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Any notes about this place..."
                  placeholderTextColor={theme.colors.placeholder}
                  multiline
                  numberOfLines={4}
                  value={igNotes}
                  onChangeText={setIgNotes}
                />
              </>
            )}
          </ScrollView>

          {/* Save button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={theme.colors.card} />
                : <Text style={styles.saveButtonText}>Save Place</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
