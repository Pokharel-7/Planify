import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CalendarCheck2, ListChecks, Users } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Button } from '../../components/ui';
import { AuthStackParamList } from '../../navigation/types';
import { useAuthStore } from '../../store/useAuthStore';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const PAGES = [
  {
    icon: ListChecks,
    title: 'Organize every task',
    description: 'Break work into spaces, lists, and tasks. Track priority, status and due dates in one clean view.',
  },
  {
    icon: Users,
    title: 'Collaborate with your team',
    description: 'Invite members, assign work, and chat in real time without leaving your workspace.',
  },
  {
    icon: CalendarCheck2,
    title: 'Stay ahead of deadlines',
    description: 'A calendar, timeline and daily planner keep every meeting and deadline in view.',
  },
];

export function OnboardingScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const completeOnboarding = useAuthStore((s) => s.completeOnboarding);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const finish = () => {
    completeOnboarding();
    navigation.replace('Welcome');
  };

  const next = () => {
    if (index < PAGES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finish();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.skipRow}>
        <Text onPress={finish} style={styles.skip}>
          Skip
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(item) => item.title}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => {
          const Icon = item.icon;
          return (
            <View style={[styles.page, { width }]}>
              <View style={styles.iconCircle}>
                <Icon size={40} color={colors.primary} strokeWidth={1.8} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          );
        }}
      />

      <View style={styles.dotsRow}>
        {PAGES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <View style={styles.footer}>
        <Button label={index === PAGES.length - 1 ? 'Get Started' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, paddingTop: spacing.xxl },
  skipRow: { alignItems: 'flex-end', paddingHorizontal: spacing.lg },
  skip: { ...typography.bodyMedium, color: colors.textSecondary },
  page: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: radius.xxl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxl,
  },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  dotActive: { backgroundColor: colors.primary, width: 22 },
  footer: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl },
});
