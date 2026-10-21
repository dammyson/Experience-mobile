import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {KeyValueCard, PrimaryButton, StatusScreen} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {customerAPI} from '../../services/api';
import {getDashboard, invalidateDashboardCache} from '../../actions/customerActions';
import {pointValue} from '../../utilities/spendable';
import {formatNaira, formatNumber, formatPts} from '../../utilities/format';
import {shortId} from '../../utilities/customerTransaction';
import {isNetworkError} from '../../utilities/errors';
import {colors, type} from '../../theme/tokens';

/**
 * Confirm and pay a purchase in full with points.
 * Params: {merchant: {id, name}, purchase, pointsNeeded, spendable}
 */
const PayWithPoints = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {merchant, purchase, pointsNeeded, spendable} = useRoute().params;
  const [result, setResult] = useState(null); // {status: 'success' | 'failed' | 'pending', message, data}

  const currency = purchase.currency || spendable?.currency || 'NGN';
  const amountLabel = formatNaira(purchase.amount, {currency});
  const ref = purchase.reference ? `#${purchase.reference}` : `#${shortId(purchase.id)}`;
  const perPoint = pointValue(spendable);
  const balanceAfter = pointsNeeded != null ? spendable.points - pointsNeeded : null;

  const handlePay = async () => {
    try {
      const response = await customerAPI.payWithPoints(merchant.id, purchase.id);
      setResult({status: 'success', data: response.data});
      // Points balances change after paying
      await dispatch(invalidateDashboardCache());
      dispatch(getDashboard(true)).catch(() => {});
    } catch (err) {
      setResult(
        isNetworkError(err)
          ? {
              status: 'pending',
              message:
                "We lost connection before the payment was confirmed. Check your activity before trying again.",
            }
          : {status: 'failed', message: err.message || 'The payment was declined.'},
      );
    }
  };

  if (result?.status === 'success') {
    const used = result.data?.points_used ?? result.data?.points_redeemed ?? pointsNeeded;
    return (
      <StatusScreen
        headerTitle="Payment"
        status="success"
        title="Payment successful"
        body={`You paid ${amountLabel} at ${merchant.name}${used != null ? ` with ${formatPts(used)}` : ''}.`}
        details={[
          {label: 'Merchant', value: merchant.name},
          {label: 'Purchase', value: ref},
          {label: 'Amount', value: amountLabel},
          used != null && {label: 'Points used', value: formatPts(used), color: colors.points},
          result.data?.reference && {label: 'Reference', value: result.data.reference},
        ]}
        primary={{title: 'Done', onPress: () => navigation.goBack()}}
      />
    );
  }

  if (result) {
    return (
      <StatusScreen
        headerTitle="Payment"
        status={result.status}
        title={result.status === 'pending' ? "We couldn't confirm the payment" : 'Payment not completed'}
        body={result.status === 'failed' ? `${result.message} No points were used.` : result.message}
        details={[
          {label: 'Merchant', value: merchant.name},
          {label: 'Purchase', value: ref},
          {label: 'Amount', value: amountLabel},
        ]}
        secondary={{title: 'Cancel', onPress: () => navigation.goBack()}}
        primary={{title: 'Try again', onPress: () => setResult(null)}}
      />
    );
  }

  return (
    <FormLayout
      title="Confirm payment"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        <PrimaryButton
          title="Pay securely"
          icon={<Icon name="lock" size={17} color={colors.white} strokeWidth={2} />}
          onPress={handlePay}
        />
      }>
      <View style={styles.hero} accessible accessibilityLabel={`You'll pay ${pointsNeeded != null ? formatPts(pointsNeeded) : amountLabel} for a ${amountLabel} purchase at ${merchant.name}`}>
        <Text style={styles.heroLabel}>You'll pay</Text>
        <Text style={styles.heroValue}>{pointsNeeded != null ? formatPts(pointsNeeded) : `${amountLabel} in points`}</Text>
        <Text style={styles.heroSub}>
          for a {amountLabel} purchase at {merchant.name}
        </Text>
      </View>

      <KeyValueCard
        title="Payment details"
        rows={[
          {label: 'Merchant', value: merchant.name},
          {label: 'Purchase', value: ref},
          {label: 'Purchase amount', value: amountLabel},
          perPoint != null && {label: 'Point value', value: `${formatNaira(perPoint, {currency})} / pt`},
        ]}
      />

      <KeyValueCard
        title="Points summary"
        rows={[
          {label: `Eligible ${merchant.name} points`, value: `${formatNumber(spendable.points)} pts`},
          pointsNeeded != null && {label: 'Points used', value: formatPts(-pointsNeeded)},
          balanceAfter != null && {divider: true},
          balanceAfter != null && {
            label: 'Balance after',
            value: formatPts(balanceAfter),
            color: colors.points,
            total: true,
          },
        ]}
      />

      <Text style={styles.note}>
        The full purchase is paid with points. Nothing is deducted until the payment is confirmed.
      </Text>
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 22,
    gap: 20,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  heroLabel: {
    ...type.label,
    color: colors.textSecondary,
  },
  heroValue: {
    ...type.balance,
    color: colors.points,
    textAlign: 'center',
  },
  heroSub: {
    ...type.label,
    color: '#D9D9E3',
    textAlign: 'center',
  },
  note: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default PayWithPoints;
