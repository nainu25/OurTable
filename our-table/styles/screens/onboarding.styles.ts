import { StyleSheet, Dimensions } from 'react-native';
import { Theme } from '../../constants/styles';

const { width, height } = Dimensions.get('window');

// These colors are intentionally hardcoded — onboarding is ALWAYS dark
const GOLD = '#C9A84C';
const WHITE = '#F5ECD8';
const TEXT_SECONDARY = '#A07858';
const DOT_INACTIVE = '#3D2214';
const BG = '#1A0F0A';

export const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: BG,
    },
    slide: {
      width,
      height,
      alignItems: 'center',
      justifyContent: 'center',
      paddingBottom: 200,
    },
    iconWrapper: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: WHITE,
      textAlign: 'center',
      marginTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.xl,
      lineHeight: 36,
    },
    subtitle: {
      fontSize: 16,
      color: TEXT_SECONDARY,
      textAlign: 'center',
      marginTop: theme.spacing.md,
      paddingHorizontal: 40,
      lineHeight: 24,
    },
    // Fixed overlay elements
    skipButton: {
      position: 'absolute',
      top: 56,
      right: theme.spacing.xl,
      zIndex: 10,
    },
    skipText: {
      fontSize: 14,
      color: '#666666',
    },
    footer: {
      position: 'absolute',
      bottom: 60,
      left: 0,
      right: 0,
      alignItems: 'center',
      gap: theme.spacing.xl,
    },
    dotsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    dot: {
      height: 8,
      borderRadius: theme.borderRadius.sm,
      backgroundColor: DOT_INACTIVE,
    },
    dotActive: {
      backgroundColor: GOLD,
    },
    // Next button (outlined)
    nextButton: {
      borderWidth: 1.5,
      borderColor: GOLD,
      borderRadius: 999,
      paddingHorizontal: 48,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    nextButtonText: {
      color: GOLD,
      fontSize: 16,
      fontWeight: '600',
    },
    // Get Started button (filled)
    getStartedButton: {
      backgroundColor: GOLD,
      borderRadius: 999,
      paddingHorizontal: 48,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    getStartedButtonText: {
      color: '#1A1A1A',
      fontSize: 16,
      fontWeight: '700',
    },
  });
