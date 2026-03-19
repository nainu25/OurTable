import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { coupleLog } from '../../lib/logger';
import { colors } from '../../constants/styles';
import styles from '../../styles/screens/couple.styles';

/** Generates a random 6-character uppercase invite code */
function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 6 }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

export default function CoupleScreen() {
  const [inviteCode, setInviteCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [createdCode, setCreatedCode] = useState<string | null>(null); // shown after table creation
  const router = useRouter();

  const handleCreateTable = async () => {
    setCreating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');

      const code = generateInviteCode();
      coupleLog.info('Creating table', { code, userId: user.id });

      // Insert a new couple row
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .insert({ invite_code: code })
        .select('id')
        .single();

      if (coupleError) throw coupleError;
      coupleLog.info('Couple row inserted', { coupleId: couple.id });

      // Update the user's profile with the new couple_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ couple_id: couple.id })
        .eq('id', user.id);

      if (profileError) throw profileError;
      coupleLog.info('Profile updated with couple_id', { coupleId: couple.id });

      // Show code on-screen (selectable!) instead of in an Alert
      setCreatedCode(code);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong.');
    } finally {
      setCreating(false);
    }
  };

  const handleJoinTable = async () => {
    const trimmedCode = inviteCode.trim().toUpperCase();
    if (!trimmedCode) {
      Alert.alert('Missing code', 'Please enter an invite code.');
      return;
    }

    setJoining(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error('Not authenticated');

      coupleLog.info('Looking up invite code', { code: trimmedCode, userId: user.id });

      // Look up the couple by invite code
      const { data: couple, error: coupleError } = await supabase
        .from('couples')
        .select('id')
        .eq('invite_code', trimmedCode)
        .single();

      if (coupleError) {
        coupleLog.warn('Invite code lookup failed', { code: trimmedCode, error: coupleError });
        if (coupleError.code === 'PGRST116') {
          Alert.alert('Invalid code', 'No table found with that invite code. Please check and try again.');
        } else {
          Alert.alert('Error looking up code', `${coupleError.code}: ${coupleError.message}`);
        }
        return;
      }

      if (!couple) {
        Alert.alert('Invalid code', 'No table found with that invite code. Please check and try again.');
        return;
      }

      coupleLog.info('Couple found, updating profile', { coupleId: couple.id });

      // Update the user's profile with the found couple_id
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ couple_id: couple.id })
        .eq('id', user.id);

      if (profileError) throw profileError;

      coupleLog.info('Joined couple successfully', { coupleId: couple.id });
      router.replace('/');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong.');
    } finally {
      setJoining(false);
    }
  };

  // ── Success state: table was just created, show selectable code ──
  if (createdCode) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Table Created!</Text>
        <Text style={styles.successSubtitle}>
          Share this code with your partner so they can join:
        </Text>

        {/* selectable={true} lets the user long-press and copy on Android */}
        <View style={styles.codeBox}>
          <Text selectable style={styles.codeText}>
            {createdCode}
          </Text>
        </View>

        <Text style={styles.codeHint}>Long-press the code above to copy it</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.buttonText}>Continue →</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.emoji}>💑</Text>
          <Text style={styles.title}>Set Up Your Table</Text>
          <Text style={styles.subtitle}>
            Create a new shared table or join your partner's existing one
          </Text>
        </View>

        {/* Create a new table */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Start a New Table</Text>
          <Text style={styles.cardDescription}>
            We'll generate a unique invite code you can share with your partner.
          </Text>
          <TouchableOpacity
            style={[styles.ctaButton, creating && styles.buttonDisabled]}
            onPress={handleCreateTable}
            disabled={creating || joining}
          >
            {creating ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.ctaButtonText}>Create Table</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Join with invite code */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Join a Table</Text>
          <Text style={styles.cardDescription}>
            Enter the 6-character invite code your partner shared with you.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. ABC123"
            placeholderTextColor={colors.textHint}
            autoCapitalize="characters"
            maxLength={6}
            value={inviteCode}
            onChangeText={setInviteCode}
          />
          <TouchableOpacity
            style={[styles.buttonOutline, joining && styles.buttonDisabled]}
            onPress={handleJoinTable}
            disabled={creating || joining}
          >
            {joining ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.buttonOutlineText}>Join Table</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


