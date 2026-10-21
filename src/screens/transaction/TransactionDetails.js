import React from 'react';
import {View, Text, StyleSheet, Share} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import {KeyValueCard, Button} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {formatType} from '../../utilities/merchantActivity';
import {formatEntryType, isEarned} from '../../utilities/customerTransaction';
import {formatPts, formatEstimate, formatNaira, formatNumber} from '../../utilities/format';
import {colors, type} from '../../theme/tokens';

const formatDateTime = value =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

/**
 * One points transaction from the customer's Wallet activity.
 * Params: {transaction, merchantName, programName, history}
 */
const TransactionDetails = () => {
  const navigation = useNavigation();
  const {transaction = {}, merchantName = 'Merchant', programName, history} = useRoute().params || {};
  const earned = isEarned(transaction);
  const points = formatPts(transaction.points_delta, {signed: true});
  const value = transaction.monetary_value != null ? formatEstimate(transaction.monetary_value) : null;
  const date = formatDateTime(transaction.created_at);

  const handleShare = () =>
    Share.share({
      message: [
        `${merchantName} — ${formatEntryType(transaction)}`,
        [points, value].filter(Boolean).join(' '),
        date,
        `Transaction ID: ${transaction.id}`,
      ].join('\n'),
    }).catch(() => {});

  return (
    <FormLayout
      title="Transaction details"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        <Button
          title="Share"
          variant="secondary"
          icon={<Icon name="send" size={17} color={colors.text} strokeWidth={2} />}
          onPress={handleShare}
        />
      }>
      <View style={styles.hero} accessible accessibilityLabel={`${merchantName}, ${points}, ${earned ? 'earned' : 'redeemed'}, ${date}`}>
        <Text style={styles.heroLabel}>{merchantName}</Text>
        <Text style={[styles.heroValue, {color: earned ? colors.points : colors.text}]}>{points}</Text>
        {!!value && <Text style={styles.heroEstimate}>{value}</Text>}
        <Text style={styles.heroDate}>{date}</Text>
      </View>

      <KeyValueCard
        title="Details"
        rows={[
          {label: 'Status', value: earned ? 'Earned' : 'Redeemed', color: earned ? colors.success : colors.textSecondary},
          {label: 'Type', value: formatEntryType(transaction)},
          programName && {label: 'Program', value: programName},
          transaction.balance_after != null && {label: 'Balance after', value: formatPts(transaction.balance_after)},
          transaction.reference_type && {label: 'Reference type', value: formatType(transaction.reference_type)},
          transaction.reference_id && {label: 'Reference', value: String(transaction.reference_id)},
          {label: 'Transaction ID', value: transaction.id || 'N/A'},
        ]}
      />

      {!!history && (
        <KeyValueCard
          title={`History with ${merchantName}`}
          rows={[
            {label: 'Transactions', value: formatNumber(history.count)},
            {label: `Earned · ${formatPts(history.earnedPoints)}`, value: formatNaira(history.earnedValue)},
            {label: `Redeemed · ${formatPts(history.redeemedPoints)}`, value: formatNaira(history.redeemedValue)},
          ]}
        />
      )}
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
  },
  heroEstimate: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    color: colors.success,
  },
  heroDate: {
    ...type.caption,
    color: colors.textMuted,
  },
});

export default TransactionDetails;
