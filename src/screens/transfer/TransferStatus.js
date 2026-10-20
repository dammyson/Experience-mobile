import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {useNavigation, useRoute} from '@react-navigation/native';
import {StatusScreen, statusColor} from '../../components/ui';
import goToTab from '../../navigations/goToTab';
import {formatNaira} from '../../utilities/format';
import {colors, type} from '../../theme/tokens';

/**
 * Result of a bank transfer. Shows what the transfer response said and nothing
 * more — there's no status endpoint to poll (README gap 3).
 *
 * Params: {status: 'success' | 'pending' | 'failed' | 'unknown', amount, currency,
 *          name, bankName, accountNumber, narration, reference, message}
 */
const TransferStatus = () => {
  const navigation = useNavigation();
  const {status, amount, currency, name, bankName, accountNumber, reference, message} = useRoute().params;
  const amountLabel = formatNaira(amount, {currency});

  const step = (label, state) => ({label, state});
  const content = {
    success: {
      icon: 'success',
      title: 'Transfer successful',
      body: `The bank confirmed ${amountLabel} reached ${name}.`,
      label: 'Completed',
      steps: [
        step('Request received', 'done'),
        step('Name verified', 'done'),
        step('Sent to bank', 'done'),
        step('Bank confirmation', 'done'),
      ],
    },
    pending: {
      icon: 'pending',
      title: 'Transfer processing',
      body: "The bank accepted the request but hasn't confirmed it yet. Check your wallet activity for the final status.",
      label: 'Pending',
      steps: [
        step('Request received', 'done'),
        step('Name verified', 'done'),
        step('Sent to bank', 'done'),
        step('Bank confirmation', 'todo'),
      ],
    },
    failed: {
      icon: 'failed',
      title: 'Transfer not completed',
      body: `${message || 'The bank declined this transfer.'} Check your wallet activity to confirm your balance.`,
      label: 'Failed',
      steps: [step('Request received', 'done'), step('Name verified', 'done'), step('Declined', 'fail')],
    },
    unknown: {
      icon: 'pending',
      title: "We couldn't confirm this transfer",
      body: "We lost connection before the bank replied. Check your wallet activity before trying again, so you don't send it twice.",
      label: 'Unconfirmed',
      steps: [step('Request sent', 'done'), step('Bank confirmation', 'todo')],
    },
  }[status] ?? null;

  if (!content) {
    return null;
  }

  const failed = status === 'failed';

  return (
    <StatusScreen
      headerTitle="Transfer status"
      status={content.icon}
      title={content.title}
      body={content.body}
      details={[
        {label: 'Amount', value: amountLabel},
        {label: 'To', value: `${name} · ${bankName} •••${String(accountNumber).slice(-4)}`},
        !!reference && {label: 'Reference', value: reference},
        {label: 'Status', value: content.label, color: statusColor(content.icon)},
      ]}
      steps={content.steps}
      secondary={{title: 'Back to home', onPress: () => goToTab(navigation, 'Home')}}
      primary={
        failed
          ? {title: 'Try again', onPress: () => navigation.replace('Transfer')}
          : {title: 'View wallet', onPress: () => goToTab(navigation, 'Wallet')}
      }>
      {status === 'pending' && (
        <View style={styles.progress}>
          <View style={styles.track} importantForAccessibility="no">
            <LinearGradient colors={[colors.primary, '#A595FF']} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.fill} />
          </View>
          <Text style={styles.progressLabel}>Sent to bank · waiting for confirmation</Text>
        </View>
      )}
    </StatusScreen>
  );
};

const styles = StyleSheet.create({
  progress: {
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.divider,
    overflow: 'hidden',
  },
  fill: {
    width: '45%',
    height: 8,
    borderRadius: 4,
  },
  progressLabel: {
    ...type.captionStrong,
    color: colors.textSecondary,
  },
});

export default TransferStatus;
