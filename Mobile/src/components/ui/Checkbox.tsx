import { Check } from 'lucide-react-native';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, typography } from '../../theme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: React.ReactNode;
}

export function Checkbox({ checked, onToggle, label }: CheckboxProps) {
  return (
    <Pressable style={styles.row} onPress={onToggle} hitSlop={6}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Check size={14} color={colors.white} strokeWidth={3} /> : null}
      </View>
      {typeof label === 'string' ? <Text style={styles.label}>{label}</Text> : label}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  box: {
    width: 20,
    height: 20,
    borderRadius: radius.sm - 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    backgroundColor: colors.white,
  },
  boxChecked: { backgroundColor: colors.primary, borderColor: colors.primary },
  label: { ...typography.body, color: colors.textSecondary, flexShrink: 1 },
});
