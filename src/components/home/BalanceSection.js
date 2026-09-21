import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {theme} from '../../theme/colors';
import TopUpIcon from '../icons/TopUpIcon';
import TransferIcon from '../icons/TransferIcon';
import BillIcon from '../icons/BillIcon';
import WithdrawIcon from '../icons/WithdrawIcon';

const ACTIONS = [
  {key: 'topup',    label: 'Top Up',   Icon: TopUpIcon},
  {key: 'transfer', label: 'Transfer', Icon: TransferIcon},
  {key: 'bill',     label: 'Bill',     Icon: BillIcon},
  {key: 'withdraw', label: 'Withdraw', Icon: WithdrawIcon},
];

const QuickActionButton = ({label, Icon, onPress}) => (
  <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
    <Icon color={theme.TEXT_PRIMARY} size={28} />
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

const BalanceSection = ({balance = '$3,890.99', onAction}) => (
  <View style={styles.container}>
    {/* Balance info */}
    <View style={styles.balanceInfo}>
      <Text style={styles.balanceTitle}>My Balance</Text>
      <Text style={styles.balanceAmount}>{balance}</Text>
    </View>

    {/* Quick actions pill — rgba(30,30,30,0.44), borderRadius 52 */}
    <View style={styles.actionsPill}>
      {ACTIONS.map(action => (
        <QuickActionButton
          key={action.key}
          label={action.label}
          Icon={action.Icon}
          onPress={() => onAction?.(action.key)}
        />
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 16,
  },
  balanceInfo: {
    gap: 4,
  },
  balanceTitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 20,
    lineHeight: 26,
    color: theme.TEXT_PRIMARY,
  },
  balanceAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 36,
    lineHeight: 50,
    color: theme.TEXT_PRIMARY,
  },
  // Actions pill — row, gap 8, padding 8px 12px, rgba(30,30,30,0.44), borderRadius 52
  actionsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(30,30,30,0.44)',
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  // Each action — column, center, gap 4, padding 12px 16px
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  actionLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    lineHeight: 20,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
});

export default BalanceSection;
