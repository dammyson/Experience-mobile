import React, {useCallback, useRef} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import RequestState from '../../components/layout/RequestState';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {formatMoney, formatType} from '../../utilities/merchantActivity';

const STATUS_COLOR = {
  COMPLETED: theme.SUCCESS_COLOR,
  SUCCESS: theme.SUCCESS_COLOR,
  PAID: theme.SUCCESS_COLOR,
  PENDING: theme.WARNING_COLOR,
  FAILED: theme.ERROR_COLOR,
  CANCELLED: theme.ERROR_COLOR,
};

// Statuses where the purchase is settled and can't be paid again
const CLOSED_STATUSES = ['COMPLETED', 'SUCCESS', 'PAID', 'FAILED', 'CANCELLED'];

const isPayable = purchase =>
  !!purchase.merchant_id && !CLOSED_STATUSES.includes((purchase.status || '').toUpperCase());

const formatDateTime = value =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const PurchaseCard = ({purchase, onPay}) => {
  const status = (purchase.status || '').toUpperCase();
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <Text style={styles.merchant} numberOfLines={1}>
          {purchase.merchant_name || 'Purchase'}
        </Text>
        {!!status && (
          <Text style={[styles.status, {color: STATUS_COLOR[status] || theme.TEXT_TERTIARY}]}>
            {formatType(status)}
          </Text>
        )}
      </View>
      <Text style={styles.amount}>{formatMoney(purchase.amount, purchase.currency)}</Text>
      <View style={styles.divider} />
      <View style={styles.meta}>
        {!!purchase.reference && <Text style={styles.metaText}>Ref: {purchase.reference}</Text>}
        {!!purchase.note && <Text style={styles.metaText}>Note: {purchase.note}</Text>}
        {!!purchase.created_at && (
          <Text style={styles.metaText}>{formatDateTime(purchase.created_at)}</Text>
        )}
      </View>
      {isPayable(purchase) && (
        <TouchableOpacity
          style={styles.payBtn}
          onPress={() => onPay(purchase)}
          activeOpacity={0.8}>
          <Text style={styles.payBtnText}>Pay with Points</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const Purchases = () => {
  const navigation = useNavigation();
  const {data, loading, refreshing, error, reload, refresh} = useRequest(
    () => customerAPI.getPurchases(),
    [],
  );

  const purchases = Array.isArray(data) ? data : data?.purchases || [];

  // Reload when coming back (e.g. after paying); the first load happens on mount
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        reload();
      }
      hasFocused.current = true;
    }, [reload]),
  );

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AppHeader title="Purchases" showBack onBack={() => navigation.goBack()} />

      <FlatList
        data={loading || error ? [] : purchases}
        keyExtractor={(item, index) => item.id || item.reference || String(index)}
        renderItem={({item}) => (
          <PurchaseCard
            purchase={item}
            onPay={purchase => navigation.navigate('PayPurchase', {purchase})}
          />
        )}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8B5CF6" />
        }
        ListEmptyComponent={
          <RequestState
            loading={loading}
            error={error}
            empty
            emptyText="No purchases yet"
            emptySubtext="Purchases merchants create for you will appear here"
            onRetry={reload}
          />
        }
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
    gap: 12,
  },
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
  merchant: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    flex: 1,
  },
  status: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
  },
  amount: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    color: theme.TEXT_PRIMARY,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  meta: {
    gap: 3,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
  },
  payBtn: {
    alignSelf: 'flex-start',
    backgroundColor: '#6715EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  payBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.WHITE,
  },
});

export default Purchases;
