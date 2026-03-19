import { View, Text } from 'react-native';
import type { Place, PlaceSource } from '../types';
import { colors } from '../constants/styles';
import styles from '../styles/components/placeCard.styles';

const SOURCE_CONFIG: Record<PlaceSource, { label: string; bg: string; color: string }> = {
  manual:    { label: 'Manual',        bg: '#F5F5F5', color: colors.manual    },
  maps:      { label: '📍 Maps',       bg: '#E8F5E9', color: colors.maps      },
  instagram: { label: '📸 Instagram',  bg: '#FCE4EC', color: colors.instagram },
};

interface Props {
  place: Place;
}

export default function PlaceCard({ place }: Props) {
  const badge = SOURCE_CONFIG[place.source] ?? SOURCE_CONFIG.manual;

  return (
    <View style={styles.card}>
      {/* Top row: source badge + visited pill */}
      <View style={styles.topRow}>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
        </View>

        <View style={styles.spacer} />

        {place.visited && (
          <View style={styles.visitedBadge}>
            <Text style={styles.visitedText}>✓ Visited</Text>
          </View>
        )}
      </View>

      {/* Name */}
      <Text style={styles.name}>{place.name}</Text>

      {/* Address */}
      {place.address ? (
        <Text style={styles.address} numberOfLines={1}>
          📌 {place.address}
        </Text>
      ) : null}

      {/* Notes preview */}
      {place.notes ? (
        <Text style={styles.notes} numberOfLines={1}>
          {place.notes}
        </Text>
      ) : null}
    </View>
  );
}


