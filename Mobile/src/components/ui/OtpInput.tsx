import React, { useRef } from 'react';
import { NativeSyntheticEvent, StyleSheet, TextInput, TextInputKeyPressEventData, View } from 'react-native';
import { colors, radius, typography } from '../../theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export function OtpInput({ length = 6, value, onChange }: OtpInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const digits = value.split('').concat(Array(length).fill('')).slice(0, length);

  const setDigit = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');
    const next = digits.slice();
    next[index] = clean.slice(-1) || '';
    const joined = next.join('');
    onChange(joined);
    if (clean && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.row}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          ref={(r) => {
            inputs.current[i] = r;
          }}
          style={[styles.box, d ? styles.boxFilled : null]}
          value={d}
          onChangeText={(t) => setDigit(t, i)}
          onKeyPress={(e) => handleKeyPress(e, i)}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    ...typography.h3,
    color: colors.textPrimary,
  },
  boxFilled: { borderColor: colors.primary, backgroundColor: colors.white },
});
