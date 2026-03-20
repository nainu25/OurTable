import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming 
} from 'react-native-reanimated';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/skeletonCard.styles';

export default function SkeletonCard() {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);
  
  const pulse = useSharedValue(0.3);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1.0, { duration: 1000 }),
      -1, // infinite
      true // reverse
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={styles.card}><Animated.View style={[styles.titleBar, animatedStyle]} /><Animated.View style={[styles.addressBar, animatedStyle]} /><View style={{ height: 16 }} /><View style={styles.footerRow}><Animated.View style={[styles.addedByBar, animatedStyle]} /><Animated.View style={[styles.ratingBar, animatedStyle]} /></View></View>
  );
}
