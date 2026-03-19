import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';
import { colors } from '../constants/styles';
import styles from '../styles/components/addPlaceModal.styles';

const log = logger.scope('add-place');

type Tab = 'manual' | 'maps' | 'instagram';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSaved: () => void;
  coupleId: string;
  userId: string;
}

/** Try to extract a readable place name from a Google Maps URL */
function parseMapsName(url: string): string {
  try {
    // https://www.google.com/maps/place/Place+Name/@...
    const placeMatch = url.match(/maps\/place\/([^/@?]+)/);
    if (placeMatch) {
      return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    }
    // ?q=Place+Name
    const qMatch = url.match(/[?&]q=([^&]+)/);
    if (qMatch) {
      return decodeURIComponent(qMatch[1].replace(/\+/g, ' '));
    }
  } catch {}
  return '';
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'manual',    label: 'Manual'    },
  { key: 'maps',      label: 'Maps Link' },
  { key: 'instagram', label: 'Instagram' },
];

export default function AddPlaceModal({ visible, onClose, onSaved, coupleId, userId }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('manual');
  const [loading, setLoading]     = useState(false);

  // Manual tab
  const [manualName,    setManualName]    = useState('');
  const [manualAddress, setManualAddress] = useState('');
  const [manualNotes,   setManualNotes]   = useState('');

  // Maps tab
  const [mapsUrl,   setMapsUrl]   = useState('');
  const [mapsName,  setMapsName]  = useState('');
  const [mapsNotes, setMapsNotes] = useState('');

  // Instagram tab
  const [igUrl,   setIgUrl]   = useState('');
  const [igName,  setIgName]  = useState('');
  const [igNotes, setIgNotes] = useState('');

  const resetAll = () => {
    setManualName(''); setManualAddress(''); setManualNotes('');
    setMapsUrl('');    setMapsName('');     setMapsNotes('');
    setIgUrl('');      setIgName('');       setIgNotes('');
    setActiveTab('manual');
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  const handleMapsUrlChange = (text: string) => {
    setMapsUrl(text);
    const parsed = parseMapsName(text);
    if (parsed) setMapsName(parsed);
  };

  const handleSave = async () => {
    // Build payload based on active tab
    let payload: Record<string, unknown> = {
      couple_id: coupleId,
      added_by:  userId,
    };

    if (activeTab === 'manual') {
      if (!manualName.trim()) {
        Alert.alert('Name required', 'Please enter a place name.');
        return;
      }
      payload = {
        ...payload,
        source:  'manual',
        name:    manualName.trim(),
        address: manualAddress.trim() || null,
        notes:   manualNotes.trim()   || null,
      };

    } else if (activeTab === 'maps') {
      if (!mapsUrl.trim()) {
        Alert.alert('URL required', 'Please paste a Google Maps URL.');
        return;
      }
      const name = mapsName.trim() || parseMapsName(mapsUrl) || 'Unknown Place';
      payload = {
        ...payload,
        source:    'maps',
        name,
        maps_url:  mapsUrl.trim(),
        notes:     mapsNotes.trim() || null,
      };

    } else if (activeTab === 'instagram') {
      if (!igName.trim()) {
        Alert.alert('Name required', 'Please enter a place name.');
        return;
      }
      payload = {
        ...payload,
        source: 'instagram',
        name:   igName.trim(),
        url:    igUrl.trim() || null,
        notes:  igNotes.trim() || null,
      };
    }

    setLoading(true);
    try {
      log.info('Saving place', { source: activeTab, name: payload.name });
      const { error } = await supabase.from('places').insert(payload);
      if (error) throw error;
      log.info('Place saved', { name: payload.name });
      resetAll();
      onSaved();
    } catch (err: any) {
      log.error('Save failed', err);
      Alert.alert('Save failed', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Add a Place</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* ── Tab bar ── */}
          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.tab}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
                {activeTab === tab.key && <View style={styles.tabUnderline} />}
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Tab content ── */}
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Manual */}
            {activeTab === 'manual' && (
              <>
                <Text style={styles.label}>Place Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Nobu Restaurant"
                  placeholderTextColor={colors.textHint}
                  value={manualName}
                  onChangeText={setManualName}
                />
                <Text style={styles.label}>Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. 105 Hudson St, New York"
                  placeholderTextColor={colors.textHint}
                  value={manualAddress}
                  onChangeText={setManualAddress}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="e.g. Saw it on TikTok, want to try the tasting menu"
                  placeholderTextColor={colors.textHint}
                  multiline
                  numberOfLines={4}
                  value={manualNotes}
                  onChangeText={setManualNotes}
                />
              </>
            )}

            {/* Maps Link */}
            {activeTab === 'maps' && (
              <>
                <Text style={styles.label}>Google Maps URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Paste a Google Maps link here"
                  placeholderTextColor={colors.textHint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={mapsUrl}
                  onChangeText={handleMapsUrlChange}
                />
                <Text style={styles.label}>Place Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Auto-filled from URL, or enter manually"
                  placeholderTextColor={colors.textHint}
                  value={mapsName}
                  onChangeText={setMapsName}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Any notes about this place..."
                  placeholderTextColor={colors.textHint}
                  multiline
                  numberOfLines={4}
                  value={mapsNotes}
                  onChangeText={setMapsNotes}
                />
              </>
            )}

            {/* Instagram */}
            {activeTab === 'instagram' && (
              <>
                <Text style={styles.label}>Instagram Post URL</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://www.instagram.com/p/..."
                  placeholderTextColor={colors.textHint}
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={igUrl}
                  onChangeText={setIgUrl}
                />
                <Text style={styles.label}>Place Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. The NoMad Restaurant"
                  placeholderTextColor={colors.textHint}
                  value={igName}
                  onChangeText={setIgName}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  placeholder="Any notes about this place..."
                  placeholderTextColor={colors.textHint}
                  multiline
                  numberOfLines={4}
                  value={igNotes}
                  onChangeText={setIgNotes}
                />
              </>
            )}
          </ScrollView>

          {/* ── Save button ── */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color={colors.background} />
                : <Text style={styles.saveButtonText}>Save Place</Text>
              }
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}


