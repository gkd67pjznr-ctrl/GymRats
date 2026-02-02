import React from 'react';
import { Pressable, Text, View , Platform } from 'react-native';
import { useThemeColors } from '../../theme';
import { FR } from '../../forgerankStyle';
import * as Haptics from 'expo-haptics';

export type NumericKeypadProps = {
  /** Current value as string */
  value: string;
  /** Callback when value changes */
  onChange: (newValue: string) => void;
  /** Whether to allow decimal point */
  decimal?: boolean;
  /** Maximum length of value */
  maxLength?: number;
  /** Callback when done/enter pressed (optional) */
  onDone?: () => void;
};

/**
 * NumericKeypad - Custom calculator-style number pad for numeric input.
 *
 * Features:
 * - Digits 0-9
 * - Backspace button
 * - Decimal point (optional)
 * - Done/Enter button (optional)
 * - Haptic feedback on press
 * - Matches Forgerank aesthetic
 */
export function NumericKeypad({
  value,
  onChange,
  decimal = false,
  maxLength = 6,
  onDone,
}: NumericKeypadProps) {
  const c = useThemeColors();

  const triggerHaptic = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDigitPress = (digit: string) => {
    if (value.length >= maxLength) return;
    triggerHaptic();
    // Prevent leading zero unless decimal part
    if (value === '0' && !value.includes('.')) {
      onChange(digit);
    } else {
      onChange(value + digit);
    }
  };

  const handleDecimalPress = () => {
    if (value.includes('.')) return;
    triggerHaptic();
    // If empty, start with '0.'
    onChange(value === '' ? '0.' : value + '.');
  };

  const handleBackspace = () => {
    if (value.length === 0) return;
    triggerHaptic();
    if (value.length === 1) {
      onChange('');
    } else {
      onChange(value.slice(0, -1));
    }
  };

  const handleClear = () => {
    if (value.length === 0) return;
    triggerHaptic();
    onChange('');
  };

  const handleDone = () => {
    triggerHaptic();
    onDone?.();
  };

  // Button grid configuration
  const buttons = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [decimal ? '.' : '', '0', '⌫'],
  ];

  const renderButton = (label: string, rowIndex: number, colIndex: number) => {
    if (label === '') return <View key={`empty-${rowIndex}-${colIndex}`} style={{ flex: 1 }} />;

    let onPress;
    let backgroundColor = c.card;
    let textColor = c.text;
    let isSpecial = false;

    if (label === '⌫') {
      onPress = handleBackspace;
      backgroundColor = c.error;
      textColor = '#fff';
      isSpecial = true;
    } else if (label === '.') {
      onPress = handleDecimalPress;
      backgroundColor = c.muted;
      textColor = c.text;
      isSpecial = true;
    } else {
      onPress = () => handleDigitPress(label);
    }

    return (
      <Pressable
        key={`${rowIndex}-${colIndex}`}
        onPress={onPress}
        style={({ pressed }) => ({
          flex: 1,
          aspectRatio: 1,
          margin: FR.space.x1,
          borderRadius: FR.radius.button,
          backgroundColor,
          borderWidth: 1,
          borderColor: c.border,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={[
          FR.type.h2,
          { color: textColor },
          isSpecial && { fontSize: 24 },
        ]}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: FR.radius.card,
      padding: FR.space.x2,
    }}>
      {/* Display current value (optional) */}
      <View style={{
        paddingVertical: FR.space.x3,
        paddingHorizontal: FR.space.x3,
        marginBottom: FR.space.x2,
        backgroundColor: c.card,
        borderWidth: 1,
        borderColor: c.border,
        borderRadius: FR.radius.input,
        alignItems: 'flex-end',
      }}>
        <Text style={[FR.type.h1, { color: c.text }]}>
          {value || '0'}
        </Text>
      </View>

      {/* Button grid */}
      <View style={{ gap: FR.space.x1 }}>
        {buttons.map((row, rowIndex) => (
          <View key={rowIndex} style={{ flexDirection: 'row', gap: FR.space.x1 }}>
            {row.map((label, colIndex) => renderButton(label, rowIndex, colIndex))}
          </View>
        ))}
      </View>

      {/* Bottom row: Clear and Done */}
      <View style={{ flexDirection: 'row', gap: FR.space.x1, marginTop: FR.space.x2 }}>
        <Pressable
          onPress={handleClear}
          style={({ pressed }) => ({
            flex: 1,
            paddingVertical: FR.space.x3,
            borderRadius: FR.radius.button,
            backgroundColor: c.card,
            borderWidth: 1,
            borderColor: c.border,
            alignItems: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text style={[FR.type.sub, { color: c.text }]}>Clear</Text>
        </Pressable>
        {onDone && (
          <Pressable
            onPress={handleDone}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: FR.space.x3,
              borderRadius: FR.radius.button,
              backgroundColor: c.primary,
              borderWidth: 1,
              borderColor: c.primary,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={[FR.type.sub, { color: '#fff' }]}>Done</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}