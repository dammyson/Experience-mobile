import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import {SearchInput} from '../../components/ui';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';

// ── Mock data ──────────────────────────────────────────────────────────────
const TRANSACTIONS = [
  {
    date: '01 December 2025',
    items: [
      {id: '1', merchant: 'Payment Merchant', status: 'Success', amount: '$20', txId: 'TF457RF6HF', type: 'Payments'},
    ],
  },
  {
    date: '26 November 2025',
    items: [
      {id: '2', merchant: 'TopUp T-Mobile Pulse', status: 'Pending', amount: '$18', txId: 'TF689RF4RR', type: 'TopUp'},
      {id: '3', merchant: 'Withdraw ATM', status: 'Success', amount: '$50', txId: 'TF123AB7CD', type: 'Withdrawals'},
    ],
  },
  {
    date: '20 November 2025',
    items: [
      {id: '4', merchant: 'Bill Payment', status: 'Failed', amount: '$30', txId: 'TF987XY2ZA', type: 'Payments'},
      {id: '5', merchant: 'Transfer to John', status: 'Success', amount: '$100', txId: 'TF654QW3ER', type: 'Transfers'},
    ],
  },
];

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

const TransactionCard = ({item}) => (
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
      <TouchableOpacity style={styles.detailsBtn} activeOpacity={0.8}>
        <Text style={styles.detailsBtnText}>See Details</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ── Screen ─────────────────────────────────────────────────────────────────
const Activity = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return TRANSACTIONS.map(group => ({
      ...group,
      items: group.items.filter(tx => {
        const matchesFilter = activeFilter === 'All' || tx.type === activeFilter;
        const matchesSearch = search === '' ||
          tx.merchant.toLowerCase().includes(search.toLowerCase()) ||
          tx.txId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
      }),
    })).filter(group => group.items.length > 0);
  }, [activeFilter, search]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <AppHeader
          title="Activity"
          showNotification
          showCard
          hasNotification
          onNotification={() => {}}
          onCard={() => {}}
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
              <TransactionCard key={item.id} item={item} />
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
    backgroundColor: theme.PRIMARY_COLOR,
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
