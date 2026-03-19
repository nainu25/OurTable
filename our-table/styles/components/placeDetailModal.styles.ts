import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme) => StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },

  // Body
  scroll: { flex: 1 },
  content: {
    padding: theme.spacing.xl,
  },

  // Badge in detail
  badgeRow: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
  },
  sectionIcon: {
    fontSize: 20,
    width: 30,
    textAlign: 'center',
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  sectionContent: {
    flex: 1,
  },
  sectionLabel: {
    ...theme.typography.label,
    color: theme.colors.textHint,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  sectionSubValue: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 4,
  },

  // Visited Toggle
  visitedSection: {
    marginTop: theme.spacing.xl,
    paddingTop: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'center',
  },
  visitedButton: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  visitedButtonActive: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  visitedButtonInactive: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.primary,
  },
  visitedButtonText: {
    ...theme.typography.h3,
    fontSize: 16,
    fontWeight: 'bold',
  },
  visitedButtonTextActive: {
    color: '#FFFFFF', // High contrast on green
  },
  visitedButtonTextInactive: {
    color: theme.colors.primary,
  },
  unvisitLink: {
    marginTop: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  unvisitLinkText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    textDecorationLine: 'underline',
  },

  // Danger Zone
  dangerZone: {
    marginTop: theme.spacing.xxl,
    alignItems: 'center',
    paddingBottom: theme.spacing.xxl,
  },
  deleteButton: {
    padding: theme.spacing.md,
  },
  deleteButtonText: {
    ...theme.typography.small,
    color: theme.colors.error,
    fontWeight: '600',
  },
});

export default createStyles;
