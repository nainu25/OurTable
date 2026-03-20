import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/placeDetailModal.styles';
import StarRating from './StarRating';
import CustomAlert from './CustomAlert';

import { Ionicons } from '@expo/vector-icons';
import { toast } from '../lib/toast';

const log = logger.scope('place-detail');

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpdate: (updatedPlace?: any) => void;
  place: any;
  partnerName: string | null;
  currentUserId: string;
}

export default function PlaceDetailModal({ 
  visible, 
  onClose, 
  onUpdate, 
  place: initialPlace, 
  partnerName,
  currentUserId 
}: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [loading, setLoading] = useState(false);
  const [place, setPlace] = useState(initialPlace);
  const [deleteAlertVisible, setDeleteAlertVisible] = useState(false);
  useEffect(() => {
    if (initialPlace) {
      setPlace(initialPlace);
    }
  }, [initialPlace]);

  if (!place) return null;

  const isAddedByYou = place.added_by === currentUserId;
  const addedByLabel = isAddedByYou ? 'You' : 'Your Partner';

  const toggleVisited = async () => {
    const nextStatus = !place.visited;
    const updatedPlace = { ...place, visited: nextStatus };
    
    // 1. Optimistic Update
    setPlace(updatedPlace);
    onUpdate(updatedPlace);

    setLoading(true);
    try {
      const { error } = await supabase
        .from('places')
        .update({ visited: nextStatus })
        .eq('id', place.id);

      if (error) throw error;
      
      log.info('Visited status updated in DB', { id: place.id, status: nextStatus });
      toast.success(nextStatus ? 'Marked as visited!' : 'Marked as not visited');
    } catch (err: any) {
      log.error('Toggle visited failed in DB', err);
      // Rollback on error
      setPlace(place);
      onUpdate(place);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePlace = () => {
    setDeleteAlertVisible(true);
  };

  const confirmDelete = async () => {
    setDeleteAlertVisible(false);
    setLoading(true);
    try {
      const { error } = await supabase
        .from('places')
        .delete()
        .eq('id', place.id);

      if (error) throw error;
      
      log.info('Place deleted', { id: place.id });
      toast.success('Place removed from list');
      onUpdate();
      onClose();
    } catch (err: any) {
      log.error('Delete failed', err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openCoordinatesInMaps = () => {
    if (!place.latitude || !place.longitude) return;
    const label = encodeURIComponent(place.name);
    const url = Platform.OS === 'ios' 
      ? `maps:0,0?q=${place.latitude},${place.longitude}(${label})` 
      : `geo:0,0?q=${place.latitude},${place.longitude}(${label})`;
    Linking.openURL(url);
  };

  const openAddressInMaps = () => {
    if (!place.address) return;
    const url = Platform.OS === 'ios' 
      ? `maps:0,0?q=${encodeURIComponent(place.address)}` 
      : `geo:0,0?q=${encodeURIComponent(place.address)}`;
    Linking.openURL(url);
  };

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [ratingLoading, setRatingLoading] = useState(false);

  useEffect(() => {
    if (place.visited && !place.user_rating) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnim.setValue(0);
    }
  }, [place.visited, place.user_rating]);

  const updateRating = async (rating: number) => {
    const updatedPlace = { ...place, user_rating: rating };
    
    // Optimistic Update
    setPlace(updatedPlace);
    onUpdate(updatedPlace);

    setRatingLoading(true);
    try {
      const { error } = await supabase
        .from('places')
        .update({ user_rating: rating })
        .eq('id', place.id);

      if (error) throw error;
      log.info('Rating updated', { id: place.id, rating });
      toast.success('Rating saved!');
    } catch (err: any) {
      log.error('Rating update failed', err);
      // Rollback
      setPlace(place);
      onUpdate(place);
      toast.error(err.message);
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle} numberOfLines={1}>{place.name}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
          {/* Badge Row */}
          <View style={styles.badgeRow}>
             <View style={styles.badgePill}>
                <Text style={styles.badgeText}>
                   {place.source}
                </Text>
             </View>
          </View>

          {/* Address Section */}
          {place.address && (
            <View style={styles.section}>
              <Ionicons name="location-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12, marginTop: 4 }} />
              <View style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Address</Text>
                <TouchableOpacity onPress={openAddressInMaps}>
                  <Text style={[styles.sectionValue, { color: theme.colors.primary, textDecorationLine: 'underline' }]}>
                    {place.address}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Notes Section */}
          {place.notes && (
            <View style={styles.section}>
              <Ionicons name="document-text-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12, marginTop: 4 }} />
              <View style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Notes</Text>
                <Text style={styles.sectionValue}>{place.notes}</Text>
              </View>
            </View>
          )}

          {/* Maps URL Section */}
          {place.maps_url && (
            <View style={styles.section}>
              <Ionicons name="map-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12, marginTop: 4 }} />
              <View style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Google Maps</Text>
                <TouchableOpacity onPress={() => Linking.openURL(place.maps_url)}>
                  <Text style={[styles.sectionValue, { color: theme.colors.primary, textDecorationLine: 'underline' }]}>
                    Open in Maps
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Instagram / General URL Section */}
          {place.url && (
            <View style={styles.section}>
              <Ionicons name="link-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12, marginTop: 4 }} />
              <View style={styles.sectionContent}>
                <Text style={styles.sectionLabel}>Link</Text>
                <TouchableOpacity onPress={() => Linking.openURL(place.url)}>
                  <Text style={[styles.sectionValue, { color: theme.colors.primary, textDecorationLine: 'underline' }]}>
                    Open Link
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Added By Section */}
          <View style={styles.section}>
            <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12, marginTop: 4 }} />
            <View style={styles.sectionContent}>
              <Text style={styles.sectionLabel}>Added By</Text>
              <Text style={styles.sectionValue}>{addedByLabel}</Text>
              <Text style={styles.sectionSubValue}>
                {new Date(place.created_at).toLocaleDateString(undefined, {
                   month: 'short', day: 'numeric', year: 'numeric'
                })}
              </Text>
            </View>
          </View>

          {/* Coordinates Section */}
          {(place.latitude && place.longitude) && (
             <View style={styles.section}>
                <Ionicons name="navigate-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12, marginTop: 4 }} />
                <View style={styles.sectionContent}>
                  <Text style={styles.sectionLabel}>Coordinates</Text>
                  <TouchableOpacity onPress={openCoordinatesInMaps}>
                    <Text style={[styles.sectionSubValue, { marginTop: 0, color: theme.colors.primary, textDecorationLine: 'underline' }]}>
                      {place.latitude.toFixed(6)}, {place.longitude.toFixed(6)} (Open in Maps)
                    </Text>
                  </TouchableOpacity>
                </View>
             </View>
          )}

          {/* Visited Toggle Section */}
          <View style={styles.visitedSection}>
            <TouchableOpacity
              style={[
                styles.visitedButton,
                place.visited ? styles.visitedButtonActive : styles.visitedButtonInactive
              ]}
              onPress={toggleVisited}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={place.visited ? '#FFFFFF' : theme.colors.primary} size="small" />
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={[
                    styles.visitedButtonText,
                    place.visited ? styles.visitedButtonTextActive : styles.visitedButtonTextInactive
                  ]}>
                    {place.visited ? 'Visited' : 'Mark as Visited'}
                  </Text>
                  {place.visited && (
                    <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />
                  )}
                </View>
              )}
            </TouchableOpacity>

            {place.visited && !loading && (
              <View style={styles.ratingSection}>
                <Text style={styles.ratingLabel}>Your rating</Text>
                <StarRating 
                  rating={place.user_rating || 0} 
                  onRate={updateRating} 
                  size={30}
                />
                
                {!place.user_rating && (
                  <Animated.Text style={[styles.ratingPrompt, { opacity: fadeAnim }]}>
                    How was it? Leave a rating!
                  </Animated.Text>
                )}

                {!place.user_rating && (
                  <Text style={styles.ratingHint}>Tap to rate</Text>
                )}

                {ratingLoading && (
                   <ActivityIndicator size="small" color={theme.colors.primary} style={{ marginTop: 10 }} />
                )}
              </View>
            )}

            {place.visited && !loading && (
              <TouchableOpacity style={styles.unvisitLink} onPress={toggleVisited}>
                <Text style={styles.unvisitLinkText}>Mark as Not Visited</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Danger Zone */}
          {!loading && (
            <View style={styles.dangerZone}>
              <TouchableOpacity style={styles.deleteButton} onPress={deletePlace}>
                <Text style={styles.deleteButtonText}>Delete Place</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      <CustomAlert
        visible={deleteAlertVisible}
        title="Remove Place"
        message={`Are you sure you want to remove "${place.name}"? This cannot be undone.`}
        onCancel={() => setDeleteAlertVisible(false)}
        onConfirm={confirmDelete}
        isDestructive={true}
        confirmText="Remove"
        iconName="trash-outline"
        loading={loading}
      />
    </Modal>
  );
}
