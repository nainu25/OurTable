import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/placeCard.styles';
import StarRating from './StarRating';

interface Props {
  place: any;
  onPress: () => void;
  partnerName: string | null;
  currentUserId: string;
  onDelete: () => void;
}

export default function PlaceCard({ place, onPress, partnerName, currentUserId, onDelete }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'maps': 
        return { label: 'Maps', bg: isDark ? '#1B2E1E' : '#E8F5E9', color: theme.colors.maps, icon: 'map-outline' as const };
      case 'instagram': 
        return { label: 'Instagram', bg: isDark ? '#2D1F26' : '#FCE4EC', color: theme.colors.instagram, icon: 'camera-outline' as const };
      default: 
        return { label: 'Manual', bg: theme.colors.backgroundSecondary, color: theme.colors.textSecondary, icon: 'create-outline' as const };
    }
  };

  const badge = getSourceConfig(place.source);
  const isAddedByYou = place.added_by === currentUserId;
  const addedByLabel = isAddedByYou ? 'You' : 'Your Partner';

  const renderRightActions = () => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction} 
        onPress={onDelete}
        activeOpacity={0.8}
      >
        <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableRightOpen={onDelete}
      friction={2}
      rightThreshold={40}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
          <View style={[styles.sourceBadge, { backgroundColor: badge.bg, flexDirection: 'row', alignItems: 'center' }]}>
            <Ionicons name={badge.icon} size={10} color={badge.color} style={{ marginRight: 4 }} />
            <Text style={[styles.sourceBadgeText, { color: badge.color }]}>{badge.label}</Text>
          </View>
        </View>

        {place.address && (
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={theme.colors.textSecondary} />
            <Text style={styles.addressText} numberOfLines={1}>{place.address}</Text>
          </View>
        )}

        {/* Bottom row: Notes + Visited label */}
        <View style={styles.bottomRow}>
          <Text style={styles.notesPreview} numberOfLines={1}>
            {place.notes ? `"${place.notes}"` : ''}
          </Text>

          {place.visited && (
            <View style={[styles.visitedPill, { backgroundColor: isDark ? '#1B2E1E' : '#E8F5E9', flexDirection: 'row', alignItems: 'center' }]}>
              <Ionicons name="checkmark-circle" size={12} color={theme.colors.success} style={{ marginRight: 4 }} />
              <Text style={styles.visitedPillText}>Visited</Text>
            </View>
          )}
        </View>

        {/* Footer: Added by & Rating */}
        <View style={styles.footerRow}>
          <View style={styles.ratingRow}>
            <Text style={styles.addedByText}>
              Added by {addedByLabel}
            </Text>

            {place.visited && (
              <View>
                {place.user_rating > 0 ? (
                  <StarRating rating={place.user_rating} size={14} />
                ) : (
                  <Text style={styles.ratingTapHint}>Tap to rate</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
}
