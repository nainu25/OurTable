import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../context/ThemeContext';
import { createStyles } from '../../styles/screens/onboarding.styles';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'restaurant-outline' as const,
    title: 'Your shared food wishlist',
    subtitle: 'Save restaurants, cafes and hidden gems you both want to try together.',
    background: '#0D0D0D',
  },
  {
    id: '2',
    icon: 'search-outline' as const,
    title: 'Find places instantly',
    subtitle: "Search nearby or paste a link — we'll grab the details automatically.",
    background: '#111111',
  },
  {
    id: '3',
    icon: 'heart-outline' as const,
    title: 'Stay in sync',
    subtitle: "When your partner saves a spot, you'll know right away. Plan your next date night together.",
    background: '#0D0D0D',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // One shared value per dot to animate width
  const dot0 = useSharedValue(24);
  const dot1 = useSharedValue(8);
  const dot2 = useSharedValue(8);
  const dotValues = [dot0, dot1, dot2];

  const animateDots = (index: number) => {
    dotValues.forEach((d, i) => {
      d.value = withSpring(i === index ? 24 : 8, { damping: 14, stiffness: 180 });
    });
  };

  const goToSlide = (index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setCurrentIndex(index);
    animateDots(index);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('ourtable_onboarding_complete', 'true');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  const handleNext = () => {
    goToSlide(currentIndex + 1);
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/register');
  };

  const dot0Style = useAnimatedStyle(() => ({ width: dot0.value }));
  const dot1Style = useAnimatedStyle(() => ({ width: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ width: dot2.value }));
  const dotStyles = [dot0Style, dot1Style, dot2Style];

  const renderSlide = ({ item }: { item: typeof SLIDES[0] }) => (
    <View style={[styles.slide, { backgroundColor: item.background }]}>
      <View style={styles.iconWrapper}>
        <Ionicons name={item.icon} size={80} color="#C9A84C" />
      </View>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.subtitle}>{item.subtitle}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D0D0D" />

      {/* Skip button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Footer: dots + button */}
      <View style={styles.footer}>
        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.dot,
                i === currentIndex && styles.dotActive,
                dotStyles[i],
              ]}
            />
          ))}
        </View>

        {/* Prev/Next / Get Started button */}
        {currentIndex < SLIDES.length - 1 ? (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.getStartedButton} onPress={handleGetStarted} activeOpacity={0.8}>
            <Text style={styles.getStartedButtonText}>Get Started</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
