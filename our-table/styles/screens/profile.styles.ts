import { StyleSheet } from 'react-native';
import { Theme } from '../../constants/styles';

export const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  headerLeft: {
    width: 60,
  },
  headerRight: {
    width: 60,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  saveText: {
    ...theme.typography.body,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.md,
    ...theme.shadows.card,
  },
  avatarInitials: {
    fontSize: 28,
    fontWeight: '700',
    color: '#C9A84C', // brandGold overriding theme just for the avatar initial
  },
  userName: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  userEmail: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.colors.textSecondary,
    fontWeight: '600',
    marginBottom: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    ...theme.shadows.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    paddingHorizontal: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowIconText: {
    ...theme.typography.body,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowValueText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginRight: theme.spacing.xs,
  },
  rowHintText: {
    ...theme.typography.body,
    color: theme.colors.textHint,
  },
  rowInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inlineInput: {
    flex: 1,
    ...theme.typography.body,
    color: theme.colors.text,
    textAlign: 'right',
    paddingVertical: 0,
    marginRight: theme.spacing.sm,
  },
  cancelText: {
    fontSize: 14,
    color: theme.colors.textHint,
    fontWeight: '500',
  },
  dangerText: {
    color: theme.colors.error,
  },

  // Modal map for change password
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalCard: {
    width: '100%',
    backgroundColor: theme.colors.modalBackground,
    borderRadius: 16,
    padding: theme.spacing.xl,
    ...theme.shadows.card,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  modalLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  modalInput: {
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 8,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
  },
  modalButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelButton: {
    backgroundColor: theme.colors.backgroundSecondary,
    marginRight: theme.spacing.sm,
  },
  modalSaveButton: {
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  modalCancelText: {
    ...theme.typography.body,
    color: theme.colors.text,
    fontWeight: '600',
  },
  modalSaveText: {
    ...theme.typography.body,
    color: '#FFF9FB',
    fontWeight: '600',
  },
});
