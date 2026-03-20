import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/starRating.styles';

import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number; // 0-5, 0 = unrated
  onRate?: (rating: number) => void; // If provided, stars are tappable
  size?: number; // Default 24
  color?: string; // Default theme.colors.primary
}

export default function StarRating({ 
  rating, 
  onRate, 
  size = 24, 
  color 
}: StarRatingProps) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const activeColor = color || theme.colors.primary;

  const handlePress = (v: number) => {
    if (!onRate) return;
    // Tapping the same star resets to 0 (clears rating)
    if (v === rating) {
      onRate(0);
    } else {
      onRate(v);
    }
  };

  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((v) => (
        <TouchableOpacity
          key={v}
          disabled={!onRate}
          onPress={() => handlePress(v)}
          activeOpacity={0.7}
          style={styles.starButton}
        >
          <Ionicons
            name={v <= rating ? "star" : "star-outline"}
            size={size}
            color={v <= rating ? activeColor : theme.colors.textHint}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}
