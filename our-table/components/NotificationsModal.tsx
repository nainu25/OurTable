import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/components/notificationsModal.styles';

interface Props {
  visible: boolean;
  onClose: () => void;
  currentUserId: string;
  onNotificationUpdate?: () => void;
}

interface Notification {
  id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  place_id: string | null;
}

export default function NotificationsModal({
  visible,
  onClose,
  currentUserId,
  onNotificationUpdate
}: Props) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    else setRefreshing(true);

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', currentUserId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Fetch notifications failed', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (visible && currentUserId) {
      fetchNotifications();

      // Realtime subscription for notifications records
      const channel = supabase
        .channel('notifications-modal')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${currentUserId}`
        }, (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [visible, currentUserId, fetchNotifications]);

  const markAllAsRead = async () => {
    try {
      // Optimistic
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onNotificationUpdate?.();

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('recipient_id', currentUserId)
        .eq('is_read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Mark all as read failed', err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      onNotificationUpdate?.();

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Mark as read failed', err);
    }
  };

  const getTimeAgo = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diff < 60) return 'just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      if (diff < 172800) return 'Yesterday';
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.markReadText}>Mark all as read</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchNotifications(true)}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.notificationItem, !item.is_read && styles.unreadItem]}
              activeOpacity={0.7}
              onPress={() => markAsRead(item.id)}
            >
              <View style={styles.itemContent}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.timeAgo}>{getTimeAgo(item.created_at)}</Text>
              </View>
              {!item.is_read && (
                <Ionicons
                  name="ellipse"
                  size={8}
                  color={theme.colors.primary}
                  style={{ marginLeft: theme.spacing.sm }}
                />
              )}
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={64} color={theme.colors.textHint} />
                <Text style={styles.emptyText}>No notifications yet.</Text>
              </View>
            ) : null
          }
          ListHeaderComponent={
            loading && !refreshing ? <ActivityIndicator style={{ marginTop: 20 }} color={theme.colors.primary} /> : null
          }
        />
      </SafeAreaView>
    </Modal>
  );
}
