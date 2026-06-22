import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TriangleAlert, Lock, ServerCrash, WifiOff, Wrench } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button, ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';

interface StatusScreenProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

function StatusScreen({ icon, title, description, actionLabel, onAction }: StatusScreenProps) {
  return (
    <ScreenContainer>
      <View style={styles.container}>
        <View style={styles.iconWrap}>{icon}</View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
        {actionLabel ? (
          <Button label={actionLabel} onPress={onAction} style={{ marginTop: spacing.xl }} fullWidth={false} />
        ) : null}
      </View>
    </ScreenContainer>
  );
}

type NavProp = NativeStackScreenProps<MainStackParamList, any>['navigation'];

export function NotFoundScreen({ navigation }: { navigation: NavProp }) {
  return (
    <StatusScreen
      icon={<TriangleAlert size={36} color={colors.warning} />}
      title="Page not found"
      description="The screen you're looking for doesn't exist or may have been moved."
      actionLabel="Go back"
      onAction={() => navigation.goBack()}
    />
  );
}

export function ServerErrorScreen({ navigation }: { navigation: NavProp }) {
  return (
    <StatusScreen
      icon={<ServerCrash size={36} color={colors.danger} />}
      title="Something went wrong"
      description="Our servers hit a snag. Please try again in a moment."
      actionLabel="Retry"
      onAction={() => navigation.goBack()}
    />
  );
}

export function NetworkErrorScreen({ navigation }: { navigation: NavProp }) {
  return (
    <StatusScreen
      icon={<WifiOff size={36} color={colors.textTertiary} />}
      title="No internet connection"
      description="Check your Wi-Fi or mobile data and try again."
      actionLabel="Retry"
      onAction={() => navigation.goBack()}
    />
  );
}

export function MaintenanceScreen({ navigation }: { navigation: NavProp }) {
  return (
    <StatusScreen
      icon={<Wrench size={36} color={colors.primary} />}
      title="Planify is under maintenance"
      description="We're making some improvements. We'll be back shortly — thanks for your patience."
    />
  );
}

export function AccessDeniedScreen({ navigation }: { navigation: NavProp }) {
  return (
    <StatusScreen
      icon={<Lock size={36} color={colors.danger} />}
      title="Access denied"
      description="You don't have permission to view this. Contact your workspace admin if you think this is a mistake."
      actionLabel="Go back"
      onAction={() => navigation.goBack()}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: radius.xxl,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm },
});
