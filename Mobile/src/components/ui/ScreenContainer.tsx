import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: Edge[];
  scroll?: boolean;
  backgroundColor?: string;
}

export function ScreenContainer({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor = colors.background,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={edges}>
      <KeyboardAvoidingView
        style={[styles.flex, style]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
});
