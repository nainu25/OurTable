import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/placeCard.styles';
import StarRating from './StarRating';

export default function PlaceCard({ place, onPress, partnerName, currentUserId }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  const getSourceConfig = (source: string) => {
    switch (source) {
      case 'maps': 
        return { label: 'Maps', bg: isDark ? '#1B2E1E' : '#E8F5E9', color: theme.colors.maps };
      case 'instagram': 
        return { label: 'Instagram', bg: isDark ? '#2D1F26' : '#FCE4EC', color: theme.colors.instagram };
      default: 
        return { label: 'Manual', bg: theme.colors.backgroundSecondary, color: theme.colors.textSecondary };
    }
  };

  const badge = getSourceConfig(place.source);
  const isAddedByYou = place.added_by === currentUserId;
  const addedByLabel = isAddedByYou ? 'You' : 'Your Partner';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={styles.card}
    >
      {/* Top row: Name + Source badge */}
      <View style={styles.headerRow}>
        <Text style={styles.placeName} numberOfLines={1}>
          {place.name}
        </Text>
        <View style={[styles.sourceBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.sourceBadgeText, { color: badge.color }]}>
            {badge.label}
          </Text>
        </View>
      </View>

      {/* Middle row: Address if exists */}
      {place.address && (
        <View style={styles.addressRow}>
          <Text style={{ fontSize: 13 }}>📍</Text>
          <Text style={styles.addressText} numberOfLines={1}>
            {place.address}
          </Text>
        </View>
      )}

      {/* Bottom row: Notes + Visited label */}
      <View style={styles.bottomRow}>
        <Text style={styles.notesPreview} numberOfLines={1}>
          {place.notes ? `"${place.notes}"` : ''}
        </Text>

        {place.visited && (
          <View style={[styles.visitedPill, { backgroundColor: isDark ? '#1B2E1E' : '#E8F5E9' }]}>
            <Text style={styles.visitedPillText}>✓ Visited</Text>
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
  );
}

interface Props {
  place: any;
  onPress: () => void;
  partnerName: string | null;
  currentUserId: string;
}
