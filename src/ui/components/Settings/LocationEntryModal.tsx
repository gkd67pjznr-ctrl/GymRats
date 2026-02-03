/**
 * Location Entry Modal - Component for setting country and region for regional leaderboards
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '../../theme';
import { useSettingsStore } from '@/src/lib/stores';
import { updateUserLocation } from '@/src/lib/sync/repositories/userProfileRepository';

type LocationEntryModalProps = {
  visible: boolean;
  onClose: () => void;
};

export const LocationEntryModal: React.FC<LocationEntryModalProps> = ({
  visible,
  onClose,
}) => {
  const c = useThemeColors();
  const { location, updateSettings } = useSettingsStore();

  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with current location when modal opens
  useEffect(() => {
    if (visible) {
      setCountry(location.country || '');
      setRegion(location.region || '');
    }
  }, [visible, location]);

  const handleSave = async () => {
    // Validate - country is required if region is provided
    if (region.trim() && !country.trim()) {
      Alert.alert('Country Required', 'Please enter a country if you specify a region.');
      return;
    }

    setIsSaving(true);

    try {
      // Update local settings
      const newLocation = {
        zipCode: '', // Keep empty for now, not using zip code
        country: country.trim() || '',
        region: region.trim() || '',
      };
      updateSettings({ location: newLocation });

      // Sync to backend
      const success = await updateUserLocation({
        country: country.trim() || null,
        region: region.trim() || null,
      });

      if (!success) {
        // Saved locally but failed to sync - inform user
        Alert.alert(
          'Saved Locally',
          'Your location was saved locally but could not be synced to the server. It will sync when you next connect.',
          [{ text: 'OK', onPress: onClose }]
        );
        return;
      }

      Alert.alert(
        'Location Saved',
        country.trim()
          ? `Your location has been set to ${region.trim() ? `${region.trim()}, ` : ''}${country.trim()}`
          : 'Your location has been cleared.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch {
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    Alert.alert(
      'Clear Location',
      'Are you sure you want to clear your location? You will no longer appear in regional leaderboards.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            setCountry('');
            setRegion('');
            setIsSaving(true);

            try {
              updateSettings({
                location: { zipCode: '', country: '', region: '' }
              });
              await updateUserLocation({ country: null, region: null });

              Alert.alert('Location Cleared', 'Your location has been removed.', [
                { text: 'OK', onPress: onClose }
              ]);
            } catch {
              Alert.alert('Error', 'Failed to clear location. Please try again.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    onClose();
  };

  const hasLocation = location.country || location.region;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
        <View style={[styles.modalContent, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.header}>
            <Ionicons name="location-outline" size={28} color={c.primary} />
            <Text style={[styles.title, { color: c.text }]}>
              Set Your Location
            </Text>
          </View>

          <Text style={[styles.subtitle, { color: c.muted }]}>
            Enter your location to compete in regional leaderboards. This is optional and can be changed at any time.
          </Text>

          {/* Privacy Notice */}
          <View style={[styles.privacyNotice, { backgroundColor: c.bg, borderColor: c.border }]}>
            <Ionicons name="shield-checkmark-outline" size={16} color={c.muted} />
            <Text style={[styles.privacyText, { color: c.muted }]}>
              Your location is only used for leaderboard filtering. Country and region are visible to other users on leaderboards.
            </Text>
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: c.text }]}>Country</Text>
            <TextInput
              value={country}
              onChangeText={setCountry}
              placeholder="e.g., United States, Canada, UK"
              placeholderTextColor={c.muted}
              style={[
                styles.input,
                { backgroundColor: c.bg, color: c.text, borderColor: c.border }
              ]}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputSection}>
            <Text style={[styles.label, { color: c.text }]}>Region / State / Province</Text>
            <TextInput
              value={region}
              onChangeText={setRegion}
              placeholder="e.g., California, Ontario, England"
              placeholderTextColor={c.muted}
              style={[
                styles.input,
                { backgroundColor: c.bg, color: c.text, borderColor: c.border }
              ]}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.buttonRow}>
            {hasLocation && (
              <Pressable
                style={[styles.clearButton, { borderColor: '#fca5a5', backgroundColor: '#fee2e2' }]}
                onPress={handleClear}
                disabled={isSaving}
              >
                <Text style={[styles.clearButtonText, { color: '#991b1b' }]}>Clear</Text>
              </Pressable>
            )}
            <Pressable
              style={[styles.button, styles.cancelButton, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={handleCancel}
              disabled={isSaving}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, { backgroundColor: c.primary }]}
              onPress={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { color: '#fff', fontWeight: 'bold' }]}>Save</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  privacyText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  inputSection: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
});

export default LocationEntryModal;
