import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { ScreenContainer } from '../../components/ui';
import { MainStackParamList } from '../../navigation/types';
import { EsewaPaymentRequest, subscriptionService } from '../../services/subscriptionService';
import { colors, radius, spacing, typography } from '../../theme';

type Props = NativeStackScreenProps<MainStackParamList, 'PaymentWebView'>;

// Builds a self-submitting HTML form that POSTs straight to eSewa's payment
// page — this is what a browser would do automatically on a real website;
// a WebView needs the form given to it explicitly since there's no user
// interaction to trigger it.
function buildFormHtml(paymentUrl: string, fields: EsewaPaymentRequest) {
  const inputs = Object.entries(fields)
    .map(([key, value]) => `<input type="hidden" name="${key}" value="${value}" />`)
    .join('\n');

  return `
    <html>
      <body onload="document.forms[0].submit()">
        <form action="${paymentUrl}" method="POST">
          ${inputs}
        </form>
      </body>
    </html>
  `;
}

export function PaymentWebViewScreen({ navigation, route }: Props) {
  const { paymentUrl, paymentRequest } = route.params;
  const [verifying, setVerifying] = useState(false);

  const handleNavChange = async (navState: WebViewNavigation) => {
    const url = navState.url;

    // eSewa redirects to our configured success/failure URL with a
    // base64-encoded `data` query param once the payment completes —
    // we intercept that redirect before the WebView tries to actually
    // load the (non-existent, web-only) destination page.
    if (url.includes('/payment/success') || url.includes('/payment/failure')) {
      const isSuccess = url.includes('/payment/success');
      const dataMatch = url.match(/[?&]data=([^&]+)/);
      const encodedData = dataMatch ? decodeURIComponent(dataMatch[1]) : null;

      if (isSuccess && encodedData) {
        setVerifying(true);
        try {
          await subscriptionService.verifyPayment(encodedData);
          Alert.alert('Payment successful', 'Your subscription has been upgraded.', [
            { text: 'OK', onPress: () => navigation.navigate('Subscription') },
          ]);
        } catch (err: any) {
          Alert.alert(
            'Verification failed',
            err?.response?.data?.message || 'Payment went through but we could not verify it. Please contact support.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } finally {
          setVerifying(false);
        }
      } else {
        Alert.alert('Payment cancelled', 'The payment was not completed.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Complete payment</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconButton} hitSlop={8}>
          <X size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {verifying && (
        <View style={styles.verifyOverlay}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={styles.verifyText}>Verifying payment…</Text>
        </View>
      )}

      <WebView
        source={{ html: buildFormHtml(paymentUrl, paymentRequest) }}
        onNavigationStateChange={handleNavChange}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}
      />
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
  title: { ...typography.bodySemibold, color: colors.textPrimary },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  verifyOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
  },
  verifyText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm },
});
