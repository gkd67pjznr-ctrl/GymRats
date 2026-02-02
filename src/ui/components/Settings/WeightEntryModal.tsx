/**
 * Weight Entry Modal - Component for entering/updating bodyweight
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  TextInput,
  ScrollView,
} from 'react-native';
import { useThemeColors } from '../../theme';
import { NumberInput } from '../LiveWorkout/NumberInput';
import { useSettingsStore } from '@/src/lib/stores';
import { lbToKg, kgToLb } from '@/src/lib/units';

type WeightEntryModalProps = {
  visible: boolean;
  onClose: () => void;
  initialWeightKg?: number;
  entryDate?: string; // YYYY-MM-DD format, defaults to today
  mode?: 'current' | 'historical';
};

export const WeightEntryModal: React.FC<WeightEntryModalProps> = ({
  visible,
  onClose,
  initialWeightKg,
  entryDate,
  mode = 'current',
}) => {
  const c = useThemeColors();
  const [weightKg, setWeightKg] = useState<number>(initialWeightKg || 70);
  const [textValue, setTextValue] = useState<string>('');
  const [dateInput, setDateInput] = useState<string>(entryDate || '');
  const { unitSystem, bodyweight, addWeightEntry, updateCurrentWeight } = useSettingsStore();

  // Initialize with current bodyweight if no initial value
  useEffect(() => {
    if (initialWeightKg === undefined && mode === 'current') {
      setWeightKg(bodyweight);
    } else if (initialWeightKg !== undefined) {
      setWeightKg(initialWeightKg);
    }
  }, [initialWeightKg, bodyweight, mode]);

  // Update text value when weight changes
  useEffect(() => {
    if (unitSystem === 'lb') {
      setTextValue(kgToLb(weightKg).toFixed(1));
    } else {
      setTextValue(weightKg.toFixed(1));
    }
  }, [weightKg, unitSystem]);

  // Initialize date input
  useEffect(() => {
    if (!dateInput) {
      const today = new Date().toISOString().split('T')[0];
      setDateInput(today);
    }
  }, [dateInput]);

  const handleTextChange = (text: string) => {
    setTextValue(text);
    const numericValue = parseFloat(text) || 0;
    if (unitSystem === 'lb') {
      setWeightKg(lbToKg(numericValue));
    } else {
      setWeightKg(numericValue);
    }
  };

  const handleIncrement = () => {
    const step = unitSystem === 'lb' ? 1 : 0.5; // 1lb or 0.5kg increments
    if (unitSystem === 'lb') {
      setWeightKg(prev => lbToKg(kgToLb(prev) + step));
    } else {
      setWeightKg(prev => prev + step);
    }
  };

  const handleDecrement = () => {
    const step = unitSystem === 'lb' ? 1 : 0.5;
    const newWeight = unitSystem === 'lb'
      ? lbToKg(Math.max(0, kgToLb(weightKg) - step))
      : Math.max(0, weightKg - step);
    setWeightKg(newWeight);
  };

  const handleCommit = () => {
    // Validate weight
    if (weightKg <= 0 || weightKg > 300) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 0.1 and 300 kg.');
      return;
    }

    // Validate date if historical entry
    if (mode === 'historical') {
      if (!dateInput || !/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        Alert.alert('Invalid Date', 'Please enter a valid date in YYYY-MM-DD format.');
        return;
      }
      const date = new Date(dateInput);
      if (isNaN(date.getTime())) {
        Alert.alert('Invalid Date', 'Please enter a valid date.');
        return;
      }
      if (date > new Date()) {
        Alert.alert('Invalid Date', 'Cannot enter future dates.');
        return;
      }
    }

    // Save weight entry
    if (mode === 'historical') {
      addWeightEntry(weightKg, dateInput);
    } else {
      updateCurrentWeight(weightKg);
    }

    Alert.alert(
      'Weight Saved',
      mode === 'historical'
        ? `Weight entry saved for ${dateInput}`
        : 'Current weight updated',
      [{ text: 'OK', onPress: onClose }]
    );
  };

  const handleCancel = () => {
    onClose();
  };

  const displayWeight = unitSystem === 'lb' ? kgToLb(weightKg) : weightKg;
  const displayUnit = unitSystem === 'lb' ? 'lb' : 'kg';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.8)' }]}>
        <View style={[styles.modalContent, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.title, { color: c.text }]}>
            {mode === 'historical' ? 'Add Historical Weight' : 'Update Current Weight'}
          </Text>

          <Text style={[styles.subtitle, { color: c.textSecondary }]}>
            {mode === 'historical'
              ? 'Enter your bodyweight for a specific date'
              : 'Update your current bodyweight'}
          </Text>

          {mode === 'historical' && (
            <View style={styles.dateSection}>
              <Text style={[styles.label, { color: c.text }]}>Date</Text>
              <TextInput
                value={dateInput}
                onChangeText={setDateInput}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={c.textSecondary}
                style={[
                  styles.dateInput,
                  { backgroundColor: c.bg, color: c.text, borderColor: c.border }
                ]}
              />
            </View>
          )}

          <View style={styles.weightSection}>
            <Text style={[styles.label, { color: c.text }]}>Weight ({displayUnit})</Text>
            <NumberInput
              value={displayWeight}
              textValue={textValue}
              label="Bodyweight"
              unit={displayUnit}
              onTextChange={handleTextChange}
              onCommit={handleCommit}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              min={0.1}
              max={300}
              stepOptions={[
                { label: '0.5', value: 0.5 },
                { label: '1', value: 1 },
                { label: '2.5', value: 2.5 },
              ]}
              presets={[
                { label: '150lb', value: 68 },
                { label: '180lb', value: 81.6 },
                { label: '200lb', value: 90.7 },
                { label: '225lb', value: 102 },
              ].map(preset => ({
                label: preset.label,
                value: unitSystem === 'lb' ? kgToLb(preset.value) : preset.value
              }))}
              keypadMode={true}
            />
          </View>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.button, styles.cancelButton, { backgroundColor: c.bg, borderColor: c.border }]}
              onPress={handleCancel}
            >
              <Text style={[styles.buttonText, { color: c.text }]}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, { backgroundColor: '#4ECDC4' }]}
              onPress={handleCommit}
            >
              <Text style={[styles.buttonText, { color: '#000', fontWeight: 'bold' }]}>Save</Text>
            </Pressable>
          </View>

          <Text style={[styles.note, { color: c.textSecondary }]}>
            Weight is stored internally in kilograms. Conversions are for display only.
          </Text>
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
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  dateSection: {
    gap: 8,
  },
  weightSection: {
    gap: 12,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
  },
  dateInput: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 18,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    borderWidth: 1,
  },
  saveButton: {},
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default WeightEntryModal;