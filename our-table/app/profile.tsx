import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput,
  Alert, Switch, Modal, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import { createStyles } from '../styles/screens/profile.styles';
import { toast } from '../lib/toast';

let Clipboard: any;
try {
  Clipboard = require('expo-clipboard');
} catch (e) {
  console.warn('Clipboard native module missing. Rebuild your dev client.');
}

export default function ProfileScreen() {
  const router = useRouter();
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const [profile, setProfile] = useState<any>(null);
  const [partner, setPartner] = useState<any>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  // Edit Name State
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Password Modal
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setEmail(user.email ?? '');

    const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (pData) {
      setProfile(pData);
      setEditedName(pData.full_name || '');

      if (pData.couple_id) {
        const { data: partnerData } = await supabase
          .from('profiles')
          .select('*')
          .eq('couple_id', pData.couple_id)
          .neq('id', pData.id)
          .single();
        if (partnerData) setPartner(partnerData);

        const { data: coupleData } = await supabase
          .from('couples')
          .select('invite_code')
          .eq('id', pData.couple_id)
          .single();
        if (coupleData) setInviteCode(coupleData.invite_code);
      }
    }
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const saveName = async () => {
    if (!profile) return;
    setIsEditingName(false);
    if (editedName.trim() === profile.full_name) return;

    const { error } = await supabase.from('profiles').update({ full_name: editedName.trim() }).eq('id', profile.id);
    if (!error) {
      setProfile({ ...profile, full_name: editedName.trim() });
      toast.success('Name updated!');
    } else {
      toast.error('Failed to update name');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPassword(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated!');
      setPasswordModalVisible(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const copyInviteCode = async () => {
    if (inviteCode) {
      if (Clipboard?.setStringAsync) {
        await Clipboard.setStringAsync(inviteCode);
        toast.success('Invite code copied!');
      } else {
        toast.error('Native Clipboard module requires app rebuild');
      }
    }
  };

  const handleLeaveTable = () => {
    Alert.alert(
      'Leave table?',
      'You and your partner will no longer share places.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('profiles').update({ couple_id: null }).eq('id', profile.id);
            toast.info('You have left the table');
            router.replace('/');
          }
        }
      ]
    );
  };

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive', onPress: async () => {
          await supabase.auth.signOut();
          toast.info('Signed out');
        }
      }
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Are you sure?',
      'This will permanently delete your account and all your data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Warning',
              'This action CANNOT be undone. Are you absolutely sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Permanently',
                  style: 'destructive',
                  onPress: () => {
                    executeDeleteAccount();
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const executeDeleteAccount = async () => {
    try {
      if (!profile?.couple_id) {
        await supabase.from('places').delete().eq('added_by', profile?.id);
      } else {
        await supabase.from('profiles').update({ couple_id: null }).eq('id', profile.id);
      }
      
      const { error } = await supabase.rpc('delete_user');
      
      if (error) throw new Error(error.message || 'RPC invocation failed');
      
      await supabase.auth.signOut();
      toast.success('Account deleted');
      router.replace('/(auth)/login');
    } catch (e: any) {
      toast.error(`Account deletion failed: ${e.message}`);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerRight}>
          {isEditingName && (
            <TouchableOpacity onPress={saveName}>
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>{getInitials(profile?.full_name)}</Text>
          </View>
          <Text style={styles.userName}>{profile?.full_name || 'Loading...'}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Section 1: Your Account */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Your Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="person-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowIconText}>Display name</Text>
              </View>
              {isEditingName ? (
                <View style={styles.rowInputContainer}>
                  <TextInput
                    style={styles.inlineInput}
                    value={editedName}
                    onChangeText={setEditedName}
                    autoFocus
                    placeholderTextColor={theme.colors.textHint}
                  />
                  <TouchableOpacity onPress={() => { setIsEditingName(false); setEditedName(profile?.full_name); }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.rowRight} onPress={() => setIsEditingName(true)}>
                  <Text style={styles.rowValueText}>{profile?.full_name}</Text>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            <TouchableOpacity
              style={[styles.row, { borderBottomWidth: 0 }]}
              onPress={() => setPasswordModalVisible(true)}
            >
              <View style={styles.rowLeft}>
                <Ionicons name="lock-closed-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowIconText}>Change password</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Section 2: Your Table */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Your Table</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Ionicons name="heart-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowIconText}>Partner</Text>
              </View>
              <View style={styles.rowRight}>
                {partner ? (
                  <Text style={styles.rowValueText}>{partner.full_name}</Text>
                ) : (
                  <Text style={styles.rowHintText}>No partner linked</Text>
                )}
              </View>
            </View>

            {inviteCode && (
              <TouchableOpacity style={styles.row} onPress={copyInviteCode}>
                <View style={styles.rowLeft}>
                  <Ionicons name="link-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                  <Text style={styles.rowIconText}>Invite code</Text>
                </View>
                <View style={styles.rowRight}>
                  <Text style={[styles.rowValueText, { fontFamily: 'monospace', letterSpacing: 1.5 }]}>
                    {inviteCode}
                  </Text>
                  <Ionicons name="copy-outline" size={18} color={theme.colors.textSecondary} />
                </View>
              </TouchableOpacity>
            )}

            {profile?.couple_id && (
              <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleLeaveTable}>
                <View style={styles.rowLeft}>
                  <Ionicons name="exit-outline" size={20} color={theme.colors.error} style={{ marginRight: 12 }} />
                  <Text style={[styles.rowIconText, styles.dangerText]}>Leave table</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.error} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Section 3: Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Appearance</Text>
          <View style={styles.card}>
            <View style={[styles.row, { borderBottomWidth: 0 }]}>
              <View style={styles.rowLeft}>
                <Ionicons name={isDark ? "moon-outline" : "sunny-outline"} size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowIconText}>Dark mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              />
            </View>
          </View>
        </View>

        {/* Section 4: Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Danger Zone</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleSignOut}>
              <View style={styles.rowLeft}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.textSecondary} style={{ marginRight: 12 }} />
                <Text style={styles.rowIconText}>Sign out</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.row, { borderBottomWidth: 0 }]} onPress={handleDeleteAccount}>
              <View style={styles.rowLeft}>
                <Ionicons name="trash-outline" size={20} color={theme.colors.error} style={{ marginRight: 12 }} />
                <Text style={[styles.rowIconText, styles.dangerText]}>Delete account</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Change Password</Text>

            <Text style={styles.modalLabel}>New Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Enter new password"
              placeholderTextColor={theme.colors.placeholder}
            />

            <Text style={styles.modalLabel}>Confirm Password</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm new password"
              placeholderTextColor={theme.colors.placeholder}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setPasswordModalVisible(false)}
                disabled={changingPassword}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleChangePassword}
                disabled={changingPassword}
              >
                {changingPassword ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalSaveText}>Save</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
