import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme) => StyleSheet.create({
  flex:     { flex: 1 },
  safeArea: { flex: 1, backgroundColor: theme.colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
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
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    position: 'relative',
  },
  tabText: {
    ...theme.typography.label,
    fontWeight: '500',
    color: theme.colors.textHint,
  },
  tabTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },

  // Scroll content
  scroll: { flex: 1 },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 16,
  },

  // Form
  label: {
    ...theme.typography.label,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 6,
    marginTop: theme.spacing.lg,
  },
  input: {
    borderWidth: 1.5,
    borderColor: theme.colors.inputBorder,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 14,
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.inputBackground,
  },
  multiline: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Footer
  footer: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: {
    color: '#FFFFFF',
    ...theme.typography.h3,
    fontWeight: '700',
  },
  hint: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  hintError: {
    ...theme.typography.small,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
    fontWeight: '500',
  },

  // Search Results
  resultsList: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    maxHeight: 210, // ~3.5 items with scrolling
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md, // Add gap before next field
    zIndex: 100,
    elevation: 3,
    overflow: 'hidden',
  },
  resultItem: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  resultName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  resultAddress: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },

  // Selected Card
  selectedCard: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.maps,
    padding: theme.spacing.md,
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCardInfo: {
    flex: 1,
  },
  selectedCardName: {
    ...theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
  },
  selectedCardAddress: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  clearSelection: {
    width: 28,
    height: 28,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  clearSelectionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyText: {
    ...theme.typography.small,
    color: theme.colors.textHint,
    textAlign: 'center',
    paddingVertical: theme.spacing.md,
  },
});

export default createStyles;
