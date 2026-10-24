import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import Clipboard from '@react-native-clipboard/clipboard';
import {showMessage} from 'react-native-flash-message';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {
  BalanceCard,
  Button,
  ChipGroup,
  ConfirmSheet,
  EmptyState,
  SkeletonList,
} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {getTransactions} from '../../actions/customerActions';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import useWalletAccount from '../../utilities/useWalletAccount';
import {buildNameLookup, isEarned, formatEntryType, getMerchantHistory} from '../../utilities/customerTransaction';
import {formatPts, formatActivityDate} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'earned', label: 'Earned'},
  {id: 'redeemed', label: 'Redeemed'},
];

const TransactionCard = ({item, onDetails}) => (
  <View style={styles.txCard}>
    <View style={styles.txRow}>
      <Text style={styles.txTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={[styles.txStatus, {color: item.statusColor}]}>{item.status}</Text>
    </View>
    <View style={styles.txRow}>
      <View style={styles.txAmountBlock}>
        <Text style={[styles.txAmount, {color: item.amountColor}]}>{item.amount}</Text>
        <Text style={styles.txSub} numberOfLines={1}>
          {item.sub}
        </Text>
      </View>
      <TouchableOpacity
        onPress={onDetails}
        style={styles.detailsBtn}
        hitSlop={{top: 6, bottom: 6}}
        accessibilityRole="button"
        accessibilityLabel={`See details for ${item.title}, ${item.amount}`}
        activeOpacity={0.85}>
        <Text style={styles.detailsText}>See details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const Wallet = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {dashboard, transactions, transactionsLoading} = useSelector(state => state.customer);
  const wallet = useWalletAccount();
  const pointsReq = useRequest(() => customerAPI.getPointsByMerchant(), []);

  const totalPoints = dashboard?.wallet_summary?.total_points ?? pointsReq.data?.total_points ?? 0;
  const programCount = dashboard?.wallet_summary?.program_count ?? pointsReq.data?.merchant_count ?? 0;
  const [filter, setFilter] = useState('all');
  const [txError, setTxError] = useState(null);
  const [addMoneyOpen, setAddMoneyOpen] = useState(false);

  const loadTransactions = useCallback(
    (force = false) => {
      setTxError(null);
      dispatch(getTransactions(force)).catch(err => setTxError(err.message));
    },
    [dispatch],
  );

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // Pick up a new wallet or balance after transfers / identity verification
  const hasFocused = useRef(false);
  const {reload: reloadWallet} = wallet;
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        reloadWallet();
      }
      hasFocused.current = true;
    }, [reloadWallet]),
  );

  const names = useMemo(() => buildNameLookup(pointsReq.data), [pointsReq.data]);

  const rows = useMemo(
    () =>
      (transactions || [])
        .filter(tx => filter === 'all' || (filter === 'earned') === isEarned(tx))
        .map(tx => {
          const earned = isEarned(tx);
          return {
            id: tx.id,
            raw: tx,
            title: names.merchants[tx.merchant_id] || 'Merchant',
            status: formatEntryType(tx),
            statusColor: earned ? colors.success : colors.textSecondary,
            amount: formatPts(tx.points_delta, {signed: true}),
            amountColor: earned ? colors.points : colors.text,
            sub: [names.programs[tx.program_id], formatActivityDate(tx.created_at)].filter(Boolean).join(' · '),
          };
        }),
    [transactions, filter, names],
  );

  const refresh = () => {
    wallet.refresh();
    pointsReq.refresh();
    loadTransactions(true);
  };

  const copyAccount = async () => {
    Clipboard.setString(wallet.account.number);
    showMessage({message: 'Account number copied', type: 'success'});
    setAddMoneyOpen(false);
  };

  const {account} = wallet;

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Wallet" root />
      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: TAB_SCROLL_INSET}]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={wallet.refreshing} onRefresh={refresh} tintColor={colors.link} />
        }>
        <BalanceCard
          label="Total points"
          amount={totalPoints}
          kind="points"
          caption={`across ${programCount} program${programCount === 1 ? '' : 's'}`}
          onRefresh={() => Promise.all([pointsReq.refresh(), wallet.refresh()])}
        />

        {/* Wallet account actions - only show if account exists */}
        {/* {account.exists && (
          <View style={styles.actions}>
            <View style={styles.action}>
              <Button
                title="Transfer"
                size="md"
                icon={<Icon name="send" size={17} color={colors.white} strokeWidth={2} />}
                onPress={() => navigation.navigate('Transfer')}
                disabled={!account.number}
              />
            </View>
            <View style={styles.action}>
              <Button
                title="Add money"
                variant="secondary"
                size="md"
                icon={<Icon name="plus" size={17} color={colors.text} strokeWidth={2} />}
                onPress={() => setAddMoneyOpen(true)}
                disabled={!account.number}
              />
            </View>
          </View>
        )} */}

        {/* <EmptyState
          title="Open your wallet account"
          hint="Verify your identity with your BVN to get an account number for transfers and top-ups."
          action={{label: 'Verify identity', onPress: () => navigation.navigate('VerifyIdentity')}}
        /> */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Activity
          </Text>
          <ChipGroup options={FILTERS} value={filter} onChange={setFilter} accessibilityLabel="Filter activity" />
          {transactionsLoading && !transactions?.length ? (
            <SkeletonList rows={4} />
          ) : txError && !transactions?.length ? (
            <RequestState error={txError} onRetry={() => loadTransactions(true)} />
          ) : rows.length === 0 ? (
            <EmptyState
              title={filter === 'all' ? 'No activity yet' : 'Nothing here yet'}
              hint={filter === 'all' ? 'Points you earn and spend show up here.' : 'Try another filter.'}
            />
          ) : (
            rows.map(item => (
              <TransactionCard
                key={item.id}
                item={item}
                onDetails={() =>
                  navigation.navigate('TransactionDetails', {
                    transaction: item.raw,
                    merchantName: item.title,
                    programName: names.programs[item.raw.program_id],
                    history: getMerchantHistory(transactions, item.raw.merchant_id),
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* README gap 4: no top-up endpoint, so "Add money" shows the account to pay into */}
      <ConfirmSheet
        visible={addMoneyOpen}
        title="Add money"
        hero={
          <Text style={styles.sheetHint}>
            Send money to this account from any bank app. It shows in your wallet once the bank confirms it.
          </Text>
        }
        rows={[
          {label: 'Bank', value: account.bank},
          account.name && {label: 'Account name', value: account.name},
          {label: 'Account number', value: account.number || '—'},
        ]}
        editLabel="Close"
        confirmLabel="Copy number"
        onConfirm={copyAccount}
        onClose={() => setAddMoneyOpen(false)}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingHorizontal: layout.screenPadding,
    gap: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...type.sectionHeading,
    color: colors.text,
  },
  txCard: {
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  txTitle: {
    ...type.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  txStatus: {
    ...type.captionStrong,
  },
  txAmountBlock: {
    flex: 1,
    gap: 2,
  },
  txAmount: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    fontSize: 14,
  },
  txSub: {
    ...type.caption,
    color: colors.textMuted,
  },
  detailsBtn: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  detailsText: {
    ...type.captionStrong,
    color: colors.white,
  },
  sheetHint: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});

export default Wallet;
