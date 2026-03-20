import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme) => StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  badgeContainer: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: theme.colors.error,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
    paddingHorizontal: 2,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  // Filter Bar
  filterContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  filterChip: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.chipInactive,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: theme.colors.chipActive,
    borderColor: theme.colors.chipActive,
  },
  filterChipText: {
    ...theme.typography.label,
    color: theme.colors.chipTextInactive,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: theme.colors.chipTextActive,
  },

  // List
  listContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  listSeparator: {
    height: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyCard: {
    padding: theme.spacing.xl,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },

  // Floating Action Button
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 999,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: '#FFFFFF', // FAB icon is always white against primary
    fontWeight: 'bold',
  },
});

export default createStyles;
