import React, {useState, useMemo, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import {SearchInput} from '../../components/ui';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';
import {getTransactions} from '../../actions/customerActions';

const FILTERS = ['All', 'Payments', 'TopUp', 'Transfers', 'Withdrawals'];

const STATUS_COLOR = {
  Success: theme.SUCCESS_COLOR,
  Pending: theme.WARNING_COLOR,
  Failed: theme.ERROR_COLOR,
};

// ── Sub-components ─────────────────────────────────────────────────────────
const FilterChip = ({label, active, onPress}) => (
  <TouchableOpacity
    style={[styles.chip, active && styles.chipActive]}
    onPress={onPress}
    activeOpacity={0.8}>
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const TransactionCard = ({item, onSeeDetails}) => (
  <View style={styles.txCard}>
    <View style={styles.txTop}>
      <Text style={styles.txMerchant}>{item.merchant}</Text>
      <Text style={[styles.txStatus, {color: STATUS_COLOR[item.status]}]}>
        {item.status}
      </Text>
    </View>
    <Text style={styles.txAmount}>{item.amount}</Text>
    <View style={styles.txDivider} />
    <View style={styles.txBottom}>
      <View style={styles.txMeta}>
        <Text style={styles.txId}>ID Transaction: {item.txId}</Text>
        <Text style={styles.txType}>Type: {item.type}</Text>
      </View>
      <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8} onPress={onSeeDetails}>
        <Text style={styles.detailsBtnText}>See Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Helper to group transactions by date ───────────────────────────────────
const groupTransactionsByDate = (transactions) => {
  if (!Array.isArray(transactions)) return [];

  const groups = {};
  transactions.forEach(tx => {
    const date = tx.created_at ? new Date(tx.created_at).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }) : 'Unknown Date';

    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push({
      id: tx.id || tx.transaction_id || String(Math.random()),
      merchant: tx.merchant_name || tx.description || 'Transaction',
      status: tx.status || 'Success',
      amount: tx.points ? `${tx.points} pts` : tx.amount || '0',
      txId: tx.transaction_id || tx.id || 'N/A',
      type: tx.type || tx.transaction_type || 'Payments',
      raw: tx,
    });
  });

  return Object.entries(groups).map(([date, items]) => ({date, items}));
};

// ── Screen ─────────────────────────────────────────────────────────────────
const Activity = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {transactions, transactionsLoading} = useSelector(state => state.customer);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getTransactions());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(getTransactions());
  };

  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDate(transactions);
  }, [transactions]);

  const filtered = useMemo(() => {
    return groupedTransactions.map(group => ({
      ...group,
      items: group.items.filter(tx => {
        const matchesFilter = activeFilter === 'All' || tx.type === activeFilter;
        const matchesSearch = search === '' ||
          tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
          tx.txId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    })).filter(group => group.items.length > 0);
  }, [groupedTransactions, activeFilter, search]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={transactionsLoading}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }>

        <AppHeader
          title="Activity"
          showCard
          onCard={() => {}}
          walletText={"Wallet"}
        />

        {/* Search */}
        <View style={styles.searchRow}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your activity"
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersScroll}>
          {FILTERS.map(f => (
            <FilterChip
              key={f}
              label={f}
              active={activeFilter === f}
              onPress={() => setActiveFilter(f)}
            />
          ))}
        </ScrollView>

        {/* Transaction groups */}
        {filtered.map(group => (
          <View key={group.date} style={styles.group}>
            <Text style={styles.dateLabel}>{group.date}</Text>
            {group.items.map(item => (
              <TransactionCard
                key={item.id}
                item={item}
                onSeeDetails={() => navigation.navigate('TransactionDetails', {
                  transaction: {
                    date: group.date,
                    merchant: item.merchant,
                    points: item.amount.replace('$', '-'),
                    epv: `-₦${parseInt(item.amount.replace('$', '')) * 5}`,
                    status: item.status,
                    reference: 'User Reference',
                    txId: item.txId,
                    redeemType: item.type,
                    location: 'Lagos',
                    totalTransactions: 12,
                    totalReceived: '₦2,500',
                    totalReceivedRewards: 25,
                    totalRedeemed: '₦10,500',
                    totalRedeemedRewards: 40,
                  },
                })}
              />
            ))}
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        )}
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {flex: 1},
  content: {paddingBottom: 110},

  searchRow: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  filtersScroll: {
    flexGrow: 0,
  },
  filters: {
    paddingHorizontal: spacing.base,
    gap: 10,
    paddingBottom: spacing.md,
  },

  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  chipActive: {
    backgroundColor: theme.PRIMARY_COLOR,
    borderColor: theme.PRIMARY_COLOR,
  },
  chipText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  chipTextActive: {
    color: theme.WHITE,
  },

  group: {
    paddingHorizontal: spacing.base,
    gap: 12,
    marginBottom: spacing.lg,
  },
  dateLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    marginBottom: 2,
  },

  // Transaction card
  txCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 10,
  },
  txTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txMerchant: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    flex: 1,
  },
  txStatus: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
  },
  txAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    color: theme.TEXT_PRIMARY,
  },
  txDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  txBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  txMeta: {
    gap: 3,
    flex: 1,
  },
  txId: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
  },
  txType: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
  },
  detailsBtn: {
    backgroundColor: '#6715EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  detailsBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.WHITE,
  },

  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: theme.TEXT_MUTED,
  },
});

export default Activity;
