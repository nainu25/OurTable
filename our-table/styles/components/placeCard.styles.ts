import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  
  // Top Row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  placeName: {
    ...theme.typography.h3,
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  sourceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Middle Row
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  addressText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },

  // Bottom Row
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  notesPreview: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  visitedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9', // Keeping successful green tint, maybe adjust for dark?
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.full,
  },
  visitedPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.success,
  },

  // Footer Row
  footerRow: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  addedByText: {
    fontSize: 11,
    color: theme.colors.textHint,
  },

  // Rating Display
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    justifyContent: 'space-between',
  },
  ratingTapHint: {
    fontSize: 11,
    color: theme.colors.textHint,
    fontStyle: 'italic',
  },

  // Swipe Action
  deleteAction: {
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderRadius: theme.borderRadius.lg,
    marginLeft: theme.spacing.sm,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#FFFFFF',
  },
});

export default createStyles;
