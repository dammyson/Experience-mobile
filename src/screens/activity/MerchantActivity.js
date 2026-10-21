import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, FlatList, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import dayjs from 'dayjs';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {ActivityRow, Button, ChipGroup, PickerSheet} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {getMerchantPrograms} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import {useMerchantId, readPrograms, activityRow, dayLabel} from '../../utilities/merchantData';
import {toList} from '../../utilities/customerData';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const PAGE_SIZE = 20;

const TYPES = [
  {id: 'ALL', label: 'All'},
  {id: 'POINTS', label: 'Points'},
  {id: 'WALLET', label: 'Wallet'},
];

const RANGES = [
  {id: '7', label: 'Last 7 days', days: 7},
  {id: '30', label: 'Last 30 days', days: 30},
  {id: '90', label: 'Last 90 days', days: 90},
  {id: 'all', label: 'All time', days: null},
];

const FilterButton = ({label, onPress}) => (
  <TouchableOpacity
    style={styles.filterBtn}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={`Filter: ${label}`}
    activeOpacity={0.8}>
    <Text style={styles.filterText} numberOfLines={1}>
      {label}
    </Text>
    <Icon name="chevronDown" size={14} color={colors.textMuted} />
  </TouchableOpacity>
);

/**
 * Merchant activity feed. As a tab it shows everything; as the
 * CustomerActivity stack screen it takes {customerId, customerName}.
 */
const MerchantActivity = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {programs} = useSelector(state => state.merchant);
  const customerId = route.params?.customerId;

  const [activityType, setActivityType] = useState('ALL');
  const [programId, setProgramId] = useState('all');
  const [rangeId, setRangeId] = useState('7');
  const [picker, setPicker] = useState(null); // 'program' | 'range'
  const [state, setState] = useState({items: [], total: null, loading: true, loadingMore: false, error: null});

  useEffect(() => {
    if (merchantId && !programs) {
      dispatch(getMerchantPrograms(merchantId)).catch(() => {});
    }
  }, [dispatch, merchantId, programs]);

  const programOptions = useMemo(
    () => [{id: 'all', label: 'All programs'}, ...readPrograms(programs).map(p => ({id: p.id, label: p.name}))],
    [programs],
  );
  const range = RANGES.find(r => r.id === rangeId);

  const filters = useMemo(
    () => ({
      activityType: activityType === 'ALL' ? undefined : activityType,
      programId: programId === 'all' ? undefined : programId,
      customerId,
      startDate: range.days ? dayjs().subtract(range.days, 'day').format('YYYY-MM-DD') : undefined,
    }),
    [activityType, programId, customerId, range],
  );

  const requestId = useRef(0);
  const load = useCallback(
    async (offset = 0) => {
      if (!merchantId) {
        return;
      }
      const id = ++requestId.current;
      setState(s => ({...s, loading: offset === 0, loadingMore: offset > 0, error: null}));
      try {
        const response = await merchantAPI.getActivities(merchantId, {...filters, limit: PAGE_SIZE, offset});
        if (id !== requestId.current) {
          return; // a newer filter change won
        }
        const page = toList(response.data, 'activities');
        setState(s => ({
          items: offset === 0 ? page : [...s.items, ...page],
          total: response.data?.total ?? null,
          hasMore: page.length === PAGE_SIZE,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (err) {
        if (id === requestId.current) {
          setState(s => ({...s, loading: false, loadingMore: false, error: err.message}));
        }
      }
    },
    [merchantId, filters],
  );

  useEffect(() => {
    load(0);
  }, [load]);

  // New awards and reversals show up when coming back
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        load(0);
      }
      hasFocused.current = true;
    }, [load]),
  );

  // Flatten into day headers + rows
  const rows = useMemo(() => {
    const out = [];
    let lastDay = null;
    state.items.forEach((activity, i) => {
      const day = dayLabel(activity.created_at);
      if (day !== lastDay) {
        out.push({key: `day-${day}-${i}`, day});
        lastDay = day;
      }
      out.push({key: String(activity.id ?? i), activity});
    });
    return out;
  }, [state.items]);

  const header = (
    <View style={styles.filters}>
      <ChipGroup options={TYPES} value={activityType} onChange={setActivityType} accessibilityLabel="Activity type" />
      <View style={styles.filterRow}>
        <FilterButton
          label={programOptions.find(o => o.id === programId)?.label ?? 'All programs'}
          onPress={() => setPicker('program')}
        />
        <FilterButton label={range.label} onPress={() => setPicker('range')} />
      </View>
    </View>
  );

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      {customerId ? (
        <ScreenHeader title={route.params?.customerName || 'Customer activity'} onBack={() => navigation.goBack()} />
      ) : (
        <ScreenHeader title="Activity" root />
      )}
      <FlatList
        data={state.loading ? [] : rows}
        keyExtractor={item => item.key}
        renderItem={({item}) => {
          if (item.day) {
            return <Text style={styles.day}>{item.day}</Text>;
          }
          const {reversible, ...row} = activityRow(item.activity);
          return (
            <View style={styles.row}>
              <ActivityRow
                {...row}
                action={
                  reversible
                    ? {label: 'Reverse', onPress: () => navigation.navigate('ReverseAward', {activity: item.activity})}
                    : undefined
                }
              />
            </View>
          );
        }}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <RequestState
            loading={state.loading}
            error={state.error}
            onRetry={() => load(0)}
            empty
            emptyText="No activity"
            emptySubtext="Nothing matches these filters yet."
          />
        }
        ListFooterComponent={
          state.hasMore && !state.loading ? (
            <View style={styles.more}>
              <Button
                title="Load more"
                variant="secondary"
                size="md"
                loading={state.loadingMore}
                onPress={() => load(state.items.length)}
              />
            </View>
          ) : null
        }
        contentContainerStyle={[styles.list, customerId ? styles.listStack : styles.listTab]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={() => load(0)} tintColor={colors.link} />}
      />

      <PickerSheet
        visible={picker === 'program'}
        title="Program"
        options={programOptions}
        value={programId}
        searchPlaceholder="Search programs"
        onSelect={option => {
          setProgramId(option.id);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
      <PickerSheet
        visible={picker === 'range'}
        title="Date range"
        options={RANGES}
        value={rangeId}
        onSelect={option => {
          setRangeId(option.id);
          setPicker(null);
        }}
        onClose={() => setPicker(null)}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: 16,
    paddingHorizontal: layout.screenPadding,
  },
  listTab: {
    paddingBottom: TAB_SCROLL_INSET,
  },
  listStack: {
    paddingBottom: 32,
  },
  filters: {
    gap: 10,
    marginBottom: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterBtn: {
    flex: 1,
    height: 44,
    paddingHorizontal: 12,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
  },
  filterText: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.text,
    flex: 1,
  },
  day: {
    ...type.captionStrong,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
    marginTop: 12,
    marginBottom: 8,
  },
  row: {
    marginBottom: 8,
  },
  more: {
    marginTop: 8,
  },
});

export default MerchantActivity;
