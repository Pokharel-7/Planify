import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, MessageCircle, SquarePen } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { EmptyState, ScreenContainer, SearchBar } from '../../components/ui';
import { conversations } from '../../data/mockData';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, shadow, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'ConversationList'>;

export function ConversationListScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const filtered = conversations.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.title}>Chat</Text>
        <Pressable style={styles.iconButton} hitSlop={8}>
          <SquarePen size={19} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.searchWrap}>
        <SearchBar value={query} onChangeText={setQuery} placeholder="Search conversations" />
      </View>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MessageCircle size={32} color={colors.textTertiary} />}
          title="No messages found"
          description={query ? 'Try a different search term.' : 'Start a conversation with your team.'}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((c) => (
            <Pressable
              key={c._id}
              style={styles.row}
              onPress={() => navigation.navigate('Chat', { conversationId: c._id })}
            >
              <View>
                {c.isGroup ? (
                  <View style={styles.groupAvatar}>
                    <Text style={styles.groupAvatarText}>{c.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                ) : (
                  <Avatar member={c.participants[1]} size={48} />
                )}
                {c.online ? <View style={styles.onlineDot} /> : null}
              </View>
              <View style={styles.rowContent}>
                <View style={styles.rowTop}>
                  <Text style={styles.rowName} numberOfLines={1}>
                    {c.name}
                  </Text>
                  <Text style={styles.rowTime}>{c.lastMessageTime}</Text>
                </View>
                <View style={styles.rowBottom}>
                  <Text style={[styles.rowMessage, c.unreadCount > 0 && styles.rowMessageUnread]} numberOfLines={1}>
                    {c.lastMessage}
                  </Text>
                  {c.unreadCount > 0 ? (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadBadgeText}>{c.unreadCount}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Pressable>
          ))}
          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      )}
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
  title: { ...typography.h3, color: colors.textPrimary },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrap: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  list: { paddingHorizontal: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  groupAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatarText: { ...typography.captionMedium, color: colors.primaryDark, fontWeight: '700' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.white,
  },
  rowContent: { flex: 1, marginLeft: spacing.sm },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  rowName: { ...typography.bodySemibold, color: colors.textPrimary, flexShrink: 1, marginRight: spacing.xs },
  rowTime: { ...typography.small, color: colors.textTertiary },
  rowBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowMessage: { ...typography.caption, color: colors.textSecondary, flex: 1, marginRight: spacing.xs },
  rowMessageUnread: { color: colors.textPrimary, fontWeight: '600' },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadBadgeText: { ...typography.small, color: colors.white, fontWeight: '700' },
});
