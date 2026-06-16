import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, typography } from '../../theme';
import { Member } from '../../types';

interface AvatarProps {
  member: Member;
  size?: number;
}

export function Avatar({ member, size = 32 }: AvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: member.avatarColor },
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{member.initials}</Text>
    </View>
  );
}

export function AvatarStack({ members, max = 4 }: { members: Member[]; max?: number }) {
  const shown = members.slice(0, max);
  const extra = members.length - shown.length;
  return (
    <View style={styles.stack}>
      {shown.map((m, i) => (
        <View key={m._id} style={[styles.stacked, { marginLeft: i === 0 ? 0 : -8, zIndex: shown.length - i }]}>
          <Avatar member={m} size={26} />
        </View>
      ))}
      {extra > 0 ? (
        <View style={[styles.stacked, styles.extraBadge, { marginLeft: -8 }]}>
          <Text style={styles.extraText}>+{extra}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.white, fontWeight: '700' },
  stack: { flexDirection: 'row', alignItems: 'center' },
  stacked: { borderWidth: 2, borderColor: colors.white, borderRadius: radius.full },
  extraBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  extraText: { ...typography.small, color: colors.textSecondary, fontWeight: '700' },
});
