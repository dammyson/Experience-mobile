import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import {SearchInput} from '../../components/ui';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';
import {getMerchantActivities} from '../../actions/merchantActions';
import {
  formatMoney,
  formatType,
  getActivityAmount,
  getActivityTitle,
  isActivityCredit,
} from '../../utilities/merchantActivity';

const PAGE_SIZE = 50;

const FILTERS = [
  {key: 'ALL', label: 'All'},
  {key: 'POINTS', label: 'Points'},
  {key: 'WALLET', label: 'Wallet'},
];

const formatDate = value =>
  value
    ? new Date(value).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Unknown Date';

const groupByDate = activities => {
  const groups = {};
  activities.forEach(activity => {
    const date = formatDate(activity.created_at);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(activity);
  });
  return Object.entries(groups).map(([date, items]) => ({date, items}));
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

const ActivityCard = ({activity}) => {
  const isWallet = activity.activity_type === 'WALLET';
  const isCredit = isActivityCredit(activity);
  const time = activity.created_at
    ? new Date(activity.created_at).toLocaleTimeString('en-GB', {hour: '2-digit', minute: '2-digit'})
    : '';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.cardTitle} numberOfLines={1}>
          {getActivityTitle(activity)}
        </Text>
        <Text style={[styles.cardType, isCredit ? styles.cardTypeCredit : styles.cardTypeDebit]}>
          {formatType(activity.type)}
        </Text>
      </View>
      <Text style={styles.cardAmount}>{getActivityAmount(activity)}</Text>
      <View style={styles.cardDivider} />
      <View style={styles.cardMeta}>
        {isWallet ? (
          <Text style={styles.metaText}>
            Wallet balance: {formatMoney(activity.balance_after, activity.currency)}
          </Text>
        ) : (
          <>
            {!!activity.program_name && (
              <Text style={styles.metaText}>Program: {activity.program_name}</Text>
            )}
            {activity.monetary_value != null && (
              <Text style={styles.metaText}>
                Value: {formatMoney(activity.monetary_value, activity.currency)}
              </Text>
            )}
            {!!activity.description && activity.description !== 'merchant_award' && (
              <Text style={styles.metaText}>Note: {activity.description}</Text>
            )}
          </>
        )}
        {!!time && <Text style={styles.metaText}>Time: {time}</Text>}
      </View>
    </View>
  );
};

// ── Screen ─────────────────────────────────────────────────────────────────
const MerchantActivity = () => {
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const {activities, activitiesTotal, activitiesLoading} = useSelector(state => state.merchant);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const merchantId = user?.merchant_ids?.[0];
  const hasMore = activities.length < activitiesTotal;

  const loadActivities = useCallback(
    (offset = 0) => {
      if (merchantId) {
        dispatch(getMerchantActivities(merchantId, {limit: PAGE_SIZE, offset})).catch(() => {});
      }
    },
    [dispatch, merchantId],
  );

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    if (!activitiesLoading) {
      setRefreshing(false);
    }
  }, [activitiesLoading]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadActivities(0);
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const matches = activities.filter(activity => {
      const matchesFilter = activeFilter === 'ALL' || activity.activity_type === activeFilter;
      const matchesSearch =
        !query ||
        [getActivityTitle(activity), activity.program_name, activity.description, activity.type]
          .filter(Boolean)
          .some(field => field.toLowerCase().includes(query));
      return matchesFilter && matchesSearch;
    });
    return groupByDate(matches);
  }, [activities, activeFilter, search]);

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
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#8B5CF6"
          />
        }>
        <AppHeader title="Activity" showCard onCard={() => {}} walletText="Wallet" />

        {/* Search */}
        <View style={styles.searchRow}>
          <SearchInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search customer, program or type"
          />
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
          style={styles.filtersScroll}>
          {FILTERS.map(filter => (
            <FilterChip
              key={filter.key}
              label={filter.label}
              active={activeFilter === filter.key}
              onPress={() => setActiveFilter(filter.key)}
            />
          ))}
        </ScrollView>

        {/* Activity groups */}
        {filtered.map(group => (
          <View key={group.date} style={styles.group}>
            <Text style={styles.dateLabel}>{group.date}</Text>
            {group.items.map(activity => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </View>
        ))}

        {filtered.length === 0 && !activitiesLoading && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No activity found</Text>
          </View>
        )}

        {hasMore && (
          <TouchableOpacity
            style={styles.loadMore}
            onPress={() => loadActivities(activities.length)}
            disabled={activitiesLoading}
            activeOpacity={0.8}>
            {activitiesLoading ? (
              <ActivityIndicator color={theme.PRIMARY_COLOR} />
            ) : (
              <Text style={styles.loadMoreText}>Load more</Text>
            )}
          </TouchableOpacity>
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

  // Activity card
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    gap: 10,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  cardTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    flex: 1,
  },
  cardType: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
  },
  cardTypeCredit: {
    color: theme.SUCCESS_COLOR,
  },
  cardTypeDebit: {
    color: theme.WARNING_COLOR,
  },
  cardAmount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    color: theme.TEXT_PRIMARY,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardMeta: {
    gap: 3,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
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

  loadMore: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadMoreText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR,
  },
});

export default MerchantActivity;
