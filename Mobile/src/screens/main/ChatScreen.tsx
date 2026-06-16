import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ArrowLeft, Mic, Paperclip, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar } from '../../components/cards';
import { ScreenContainer } from '../../components/ui';
import { conversations, currentMember } from '../../data/mockData';
import { MainStackParamList } from '../../navigation/types';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'Chat'>;

export function ChatScreen({ navigation, route }: Props) {
  const conversation = conversations.find((c) => c._id === route.params.conversationId) ?? conversations[0];
  const [messages, setMessages] = useState(conversation.messages);
  const [draft, setDraft] = useState('');
  const otherParticipant = conversation.isGroup ? null : conversation.participants[1];

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [
      ...prev,
      { _id: `local-${Date.now()}`, senderId: currentMember._id, text: draft.trim(), time: 'Just now' },
    ]);
    setDraft('');
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <ArrowLeft size={20} color={colors.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {conversation.name}
          </Text>
          {otherParticipant ? (
            <Text style={styles.headerSub}>{conversation.online ? 'Online' : 'Offline'}</Text>
          ) : (
            <Text style={styles.headerSub}>{conversation.participants.length} members</Text>
          )}
        </View>
        {otherParticipant ? <Avatar member={otherParticipant} size={34} /> : <View style={{ width: 34 }} />}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.messages} showsVerticalScrollIndicator={false}>
          {messages.map((m) => {
            const isMe = m.senderId === currentMember._id;
            return (
              <View key={m._id} style={[styles.messageRow, isMe && styles.messageRowMe]}>
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
                  <Text style={[styles.bubbleText, isMe && styles.bubbleTextMe]}>{m.text}</Text>
                </View>
                <Text style={[styles.time, isMe && styles.timeMe]}>{m.time}</Text>
              </View>
            );
          })}
          {conversation.online ? (
            <View style={styles.typingRow}>
              <View style={styles.typingDot} />
              <View style={[styles.typingDot, { opacity: 0.6 }]} />
              <View style={[styles.typingDot, { opacity: 0.3 }]} />
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.inputRow}>
          <Pressable style={styles.attachButton} hitSlop={8}>
            <Paperclip size={19} color={colors.textTertiary} />
          </Pressable>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textTertiary}
            value={draft}
            onChangeText={setDraft}
            multiline
          />
          {draft.trim().length > 0 ? (
            <Pressable style={styles.sendButton} onPress={sendMessage}>
              <Send size={17} color={colors.white} />
            </Pressable>
          ) : (
            <Pressable style={styles.attachButton} hitSlop={8}>
              <Mic size={19} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginHorizontal: spacing.sm },
  headerTitle: { ...typography.bodySemibold, color: colors.textPrimary },
  headerSub: { ...typography.small, color: colors.textTertiary, marginTop: 1 },
  messages: { padding: spacing.lg },
  messageRow: { marginBottom: spacing.md, maxWidth: '78%', alignSelf: 'flex-start' },
  messageRowMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  bubble: { borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleOther: { backgroundColor: colors.surfaceMuted, borderTopLeftRadius: 4 },
  bubbleMe: { backgroundColor: colors.primary, borderTopRightRadius: 4 },
  bubbleText: { ...typography.body, color: colors.textPrimary },
  bubbleTextMe: { color: colors.white },
  time: { ...typography.small, color: colors.textTertiary, marginTop: 3 },
  timeMe: { textAlign: 'right' },
  typingRow: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typingDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.textTertiary, marginHorizontal: 2 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  attachButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    marginHorizontal: spacing.xs,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
