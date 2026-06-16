import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Camera } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { Button, Input, ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { authService } from '../../services/authService';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'EditProfile'>;

export function EditProfileScreen({ navigation }: Props) {
  const authUser = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [name, setName] = useState(authUser?.name || '');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    authService
      .getMe()
      .then((res) => {
        if (cancelled) return;
        const u = res.data.user;
        setName(u.name || '');
        setJobTitle(u.jobTitle || '');
        setDepartment(u.department || '');
        setBio(u.bio || '');
      })
      .catch(() => {
        // Fall back to whatever's already in the auth store
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const currentMember = {
    _id: authUser?._id || '',
    name: name || authUser?.name || 'You',
    email: authUser?.email || '',
    avatarColor: colors.primary,
    initials: (name || authUser?.name || '?')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await authService.updateProfile({ name, jobTitle, department, bio });
      updateUser({
        name: res.data.user.name,
        jobTitle: res.data.user.jobTitle,
        department: res.data.user.department,
        bio: res.data.user.bio,
      });
      navigation.goBack();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not save your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer edges={['top', 'left', 'right']}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <View>
            <Avatar member={currentMember} size={88} />
            <View style={styles.cameraBadge}>
              <Camera size={14} color={colors.white} />
            </View>
          </View>
          <Text style={styles.changePhoto}>Change photo</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Input label="Full name" value={name} onChangeText={setName} />
        <Input label="Email address" value={authUser?.email || ''} editable={false} />
        <Input label="Job title" value={jobTitle} onChangeText={setJobTitle} />
        <Input label="Department" value={department} onChangeText={setDepartment} />
        <Input
          label="Bio"
          placeholder="Tell your team a bit about yourself"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          style={{ height: 90, textAlignVertical: 'top', paddingTop: spacing.sm }}
        />

        <View style={{ height: spacing.xl }} />
        <Button label="Save changes" onPress={handleSave} loading={saving} />
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
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { ...typography.caption, color: colors.danger, marginBottom: spacing.sm },
  content: { padding: spacing.lg },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
  changePhoto: { ...typography.captionMedium, color: colors.primary, marginTop: spacing.sm },
});
