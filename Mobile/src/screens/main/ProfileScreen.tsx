import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  Bell,
  ChevronRight,
  Clock,
  CreditCard,
  Globe,
  Mail,
  HelpCircle,
  LogOut,
  MessageCircle,
  Shield,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react-native';
import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, shadow, spacing, typography } from '../../theme';

const MENU_SECTIONS: {
  title: string;
  items: { icon: any; label: string; sub?: string; route?: keyof MainStackParamList }[];
}[] = [
  {
    title: 'Account',
    items: [
      { icon: User, label: 'Edit profile', sub: 'Name, avatar, job title', route: 'EditProfile' },
      { icon: Shield, label: 'Change password', route: 'ChangePassword' },
      { icon: Bell, label: 'Notification settings', route: 'Settings' },
    ],
  },
  {
    title: 'Workspace',
    items: [
      { icon: MessageCircle, label: 'Messages', route: 'ConversationList' },
      { icon: Clock, label: 'Time tracking', route: 'TimeTracking' },
      { icon: Users, label: 'Team', route: 'TeamMembers' },
      { icon: Mail, label: 'Invitations', route: 'Invitations' },
      { icon: CreditCard, label: 'Subscription & billing', route: 'Subscription' },
      { icon: Globe, label: 'Language', sub: 'English', route: 'Settings' },
    ],
  },
  {
    title: 'Admin',
    items: [{ icon: ShieldCheck, label: 'Admin dashboard', route: 'AdminDashboard' }],
  },
  {
    title: 'Support',
    items: [{ icon: HelpCircle, label: 'Help center' }],
  },
];

export function ProfileScreen() {
  const clearSession = useAuthStore((s) => s.clearSession);
  const authUser = useAuthStore((s) => s.user);
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  const currentMember = {
    _id: authUser?._id || '',
    name: authUser?.name || 'You',
    email: authUser?.email || '',
    avatarColor: colors.primary,
    initials: (authUser?.name || '?')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  };

  const confirmLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Planify?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: clearSession },
    ]);
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Profile</Text>

        <View style={styles.profileCard}>
          <Avatar member={currentMember} size={64} />
          <View style={{ marginLeft: spacing.md, flex: 1 }}>
            <Text style={styles.name}>{currentMember.name}</Text>
            <Text style={styles.email}>{currentMember.email}</Text>
          </View>
        </View>

        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={{ marginBottom: spacing.lg }}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuCard}>
              {section.items.map((item, i) => {
                const Icon = item.icon;
                return (
                  <Pressable
                    key={item.label}
                    style={[styles.menuRow, i > 0 && styles.menuDivider]}
                    onPress={() => item.route && navigation.navigate(item.route)}
                  >
                    <View style={styles.menuIconWrap}>
                      <Icon size={18} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.sub ? <Text style={styles.menuSub}>{item.sub}</Text> : null}
                    </View>
                    <ChevronRight size={18} color={colors.textTertiary} />
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}

        <Pressable style={styles.logoutButton} onPress={confirmLogout}>
          <LogOut size={18} color={colors.danger} />
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>

        <Text style={styles.version}>Planify v1.0.0</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxxl },
  title: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.lg },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadow.sm,
  },
  name: { ...typography.h4, color: colors.textPrimary },
  email: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.xs, marginLeft: spacing.xxs },
  menuCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadow.sm,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: spacing.sm },
  menuDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  menuLabel: { ...typography.bodyMedium, color: colors.textPrimary },
  menuSub: { ...typography.caption, color: colors.textTertiary, marginTop: 1 },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: radius.md,
    height: 50,
    marginTop: spacing.sm,
  },
  logoutText: { ...typography.button, color: colors.danger, marginLeft: spacing.xs },
  version: { ...typography.small, color: colors.textTertiary, textAlign: 'center', marginTop: spacing.lg },
});
