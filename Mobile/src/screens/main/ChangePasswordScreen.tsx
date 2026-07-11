import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button, Input, ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ChangePassword'>;

export function ChangePasswordScreen({ navigation }: Props) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!current) e.current = 'Enter your current password';
    if (!next || next.length < 8) e.next = 'Use at least 8 characters';
    if (confirm !== next) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigation.goBack();
    }, 600);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Change password</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Input label="Current password" isPassword value={current} onChangeText={setCurrent} error={errors.current} />
        <Input label="New password" isPassword value={next} onChangeText={setNext} error={errors.next} />
        <Input label="Confirm new password" isPassword value={confirm} onChangeText={setConfirm} error={errors.confirm} />
        <Button label="Update password" onPress={handleSave} loading={saving} style={{ marginTop: spacing.sm }} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  headerTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: spacing.lg },
});
