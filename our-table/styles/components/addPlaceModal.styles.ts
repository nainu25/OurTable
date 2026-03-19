import { StyleSheet } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../constants/styles';

const styles = StyleSheet.create({
  flex:     { flex: 1 },
  safeArea: { flex: 1, backgroundColor: colors.background },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: '#f2f2f2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    ...typography.label,
    color: colors.textSecondary,
    fontWeight: '600',
  },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 13,
    position: 'relative',
  },
  tabText: {
    ...typography.label,
    fontWeight: '500',
    color: colors.textHint,
  },
  tabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },

  // Scroll content
  scroll: { flex: 1 },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 16,
  },

  // Form
  label: {
    ...typography.label,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6,
    marginTop: spacing.lg,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
    ...typography.body,
    color: colors.text,
    backgroundColor: '#fafafa',
  },
  multiline: {
    height: 110,
    textAlignVertical: 'top',
    paddingTop: 12,
  },

  // Footer
  footer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: {
    color: colors.background,
    ...typography.h3,
    fontWeight: '700',
  },
  hint: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  hintError: {
    ...typography.small,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },

  // Search Results
  resultsList: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
    maxHeight: 220,
    zIndex: 10,
  },
  resultItem: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resultName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  resultAddress: {
    ...typography.small,
    color: colors.textSecondary,
  },

  // Selected Card
  selectedCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    borderColor: colors.maps,
    padding: spacing.md,
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedCardInfo: {
    flex: 1,
  },
  selectedCardName: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  selectedCardAddress: {
    ...typography.small,
    color: colors.textSecondary,
    marginTop: 2,
  },
  clearSelection: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: '#EEE',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  clearSelectionText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: 'bold',
  },
  emptyText: {
    ...typography.small,
    color: colors.textHint,
    textAlign: 'center',
    paddingVertical: spacing.md,
  },
});



export default styles;
