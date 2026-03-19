import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius, shadows } from '../../constants/styles';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  spacer: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '600',
  },
  visitedBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.full,
  },
  visitedText: {
    ...typography.label,
    fontSize: 11,
    fontWeight: '600',
    color: colors.success,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    marginBottom: 4,
  },
  address: {
    ...typography.small,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  notes: {
    ...typography.small,
    color: colors.textHint,
    fontStyle: 'italic',
  },
});

export default styles;
