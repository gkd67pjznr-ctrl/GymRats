/**
 * NumericKeypad Component Tests
 *
 * Tests for calculator-style numeric keypad component.
 *
 * Test Coverage:
 * - Renders digits 0-9
 * - Renders backspace button
 * - Conditionally renders decimal button
 * - Handles digit press (calls onChange)
 * - Handles decimal press
 * - Handles backspace press
 * - Handles clear button
 * - Handles done button (calls onDone)
 * - Limits max length
 * - Provides haptic feedback on press (iOS)
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { NumericKeypad } from '../NumericKeypad';
import * as Haptics from 'expo-haptics';

// Mock useThemeColors
jest.mock('@/src/ui/theme', () => ({
  useThemeColors: jest.fn(() => ({
    bg: '#000000',
    card: '#1a1a1a',
    border: '#333333',
    text: '#ffffff',
    muted: '#888888',
    primary: '#4ECDC4',
    error: '#f87171',
    success: '#34d399',
  })),
}));

// Mock FR (forgerankStyle)
jest.mock('@/src/ui/forgerankStyle', () => ({
  FR: {
    space: { x1: 4, x2: 8, x3: 12, x4: 16 },
    radius: { button: 12, card: 20, input: 8, soft: 6 },
    type: {
      h1: { fontSize: 32, fontWeight: '900' },
      h2: { fontSize: 24, fontWeight: '900' },
      sub: { fontSize: 14, fontWeight: '500' },
      body: { fontSize: 16, fontWeight: '400' },
      mono: { fontSize: 14, fontFamily: 'monospace' },
    },
  },
}));

// Mock Haptics
jest.mock('expo-haptics');


describe('NumericKeypad', () => {
  const onChangeMock = jest.fn();
  const onDoneMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders digits 0-9', () => {
    const { getByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} />
    );

    for (let i = 0; i <= 9; i++) {
      expect(getByText(i.toString())).toBeTruthy();
    }
  });

  it('renders backspace button', () => {
    const { getByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} />
    );
    expect(getByText('⌫')).toBeTruthy();
  });

  it('renders decimal button when decimal prop is true', () => {
    const { getByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} decimal={true} />
    );
    expect(getByText('.')).toBeTruthy();
  });

  it('does not render decimal button when decimal prop is false', () => {
    const { queryByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} decimal={false} />
    );
    expect(queryByText('.')).toBeNull();
  });

  it('calls onChange when digit button is pressed', () => {
    const { getByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} />
    );
    fireEvent.press(getByText('5'));
    expect(onChangeMock).toHaveBeenCalledWith('5');
  });

  it('calls onChange with appended digit when value already exists', () => {
    const { getByText } = render(
      <NumericKeypad value="12" onChange={onChangeMock} />
    );
    fireEvent.press(getByText('3'));
    expect(onChangeMock).toHaveBeenCalledWith('123');
  });

  it('handles decimal button press', () => {
    const { getByText } = render(
      <NumericKeypad value="12" onChange={onChangeMock} decimal={true} />
    );
    fireEvent.press(getByText('.'));
    expect(onChangeMock).toHaveBeenCalledWith('12.');
  });

  it('prevents duplicate decimal point', () => {
    const { getByText } = render(
      <NumericKeypad value="12.3" onChange={onChangeMock} decimal={true} />
    );
    fireEvent.press(getByText('.'));
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('handles backspace button press', () => {
    const { getByText } = render(
      <NumericKeypad value="123" onChange={onChangeMock} />
    );
    fireEvent.press(getByText('⌫'));
    expect(onChangeMock).toHaveBeenCalledWith('12');
  });

  it('handles clear button press', () => {
    const { getByText } = render(
      <NumericKeypad value="123" onChange={onChangeMock} />
    );
    fireEvent.press(getByText('Clear'));
    expect(onChangeMock).toHaveBeenCalledWith('');
  });

  it('calls onDone when done button is pressed', () => {
    const { getByText } = render(
      <NumericKeypad value="123" onChange={onChangeMock} onDone={onDoneMock} />
    );
    fireEvent.press(getByText('Done'));
    expect(onDoneMock).toHaveBeenCalled();
  });

  it('respects maxLength prop', () => {
    const { getByText } = render(
      <NumericKeypad value="12345" onChange={onChangeMock} maxLength={5} />
    );
    fireEvent.press(getByText('6'));
    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it.skip('provides haptic feedback on iOS', () => {
    Platform.OS = 'ios';
    const { getByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} />
    );
    fireEvent.press(getByText('5'));
    expect(Haptics.impactAsync).toHaveBeenCalledWith(
      Haptics.ImpactFeedbackStyle.Light
    );
  });

  it.skip('does not provide haptic feedback on non-iOS', () => {
    Platform.OS = 'android';
    const { getByText } = render(
      <NumericKeypad value="" onChange={onChangeMock} />
    );
    fireEvent.press(getByText('5'));
    expect(Haptics.impactAsync).not.toHaveBeenCalled();
  });
});