import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme, isDark: boolean) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
  },
  titleBar: {
    width: '65%',
    height: 18,
    backgroundColor: isDark ? theme.colors.backgroundSecondary : '#E8E8E8',
    borderRadius: 8,
    marginBottom: 8,
  },
  addressBar: {
    width: '45%',
    height: 12,
    backgroundColor: isDark ? theme.colors.backgroundSecondary : '#EEEEEE',
    borderRadius: 6,
    marginBottom: 16,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
  },
  addedByBar: {
    width: '30%',
    height: 12,
    backgroundColor: isDark ? theme.colors.backgroundSecondary : '#EEEEEE',
    borderRadius: 6,
  },
  ratingBar: {
    width: '20%',
    height: 12,
    backgroundColor: isDark ? theme.colors.backgroundSecondary : '#EEEEEE',
    borderRadius: 6,
  },
});

export default createStyles;
