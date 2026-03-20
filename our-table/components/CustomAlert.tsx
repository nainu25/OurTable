import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
  cancelText?: string;
  confirmText?: string;
  isDestructive?: boolean;
  loading?: boolean;
  iconName?: keyof typeof Ionicons.glyphMap;
}

export default function CustomAlert({ 
  visible, 
  title, 
  message, 
  onCancel, 
  onConfirm, 
  cancelText = 'Cancel', 
  confirmText = 'Confirm',
  isDestructive = false,
  loading = false,
  iconName
}: CustomAlertProps) {
  const { theme, isDark } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.alertBox, { backgroundColor: theme.colors.background }]}>
          {iconName && (
            <View style={[styles.iconContainer, { backgroundColor: isDestructive ? `${theme.colors.error}20` : `${theme.colors.primary}20` }]}>
              <Ionicons name={iconName} size={32} color={isDestructive ? theme.colors.error : theme.colors.primary} />
            </View>
          )}
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{message}</Text>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.backgroundSecondary }]} 
              onPress={onCancel}
              disabled={loading}
            >
              <Text style={[styles.buttonText, { color: theme.colors.textSecondary }]}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton, { backgroundColor: isDestructive ? theme.colors.error : theme.colors.primary }]} 
              onPress={onConfirm}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>{confirmText}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // Styling handled dynamically
  },
  confirmButton: {
    // Styling handled dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
