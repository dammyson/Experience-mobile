import React, {useCallback, useState} from 'react';
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
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';
import {textStyles} from '../../theme/typography';
import {merchantAPI} from '../../services/api';

const formatMoney = (value, currency) => {
  const num = Number(value) || 0;
  const symbol = currency === 'NGN' ? '₦' : currency ? `${currency} ` : '';
  const [whole, fraction] = num.toFixed(2).split('.');
  return `${symbol}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
};

const formatLabel = value =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '—';

const formatDate = value =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const DetailRow = ({label, value, isLast}) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
);

const ProgramDetails = () => {
  const navigation = useNavigation();
  const {program} = useRoute().params;
  const {user} = useSelector(state => state.auth);
  const merchantId = user?.merchant_ids?.[0];

  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadBalance = useCallback(async () => {
    if (!merchantId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await merchantAPI.getProgramBalance(merchantId, program.id);
      setBalance(response.data);
    } catch (err) {
      setError(err?.message || 'Failed to fetch program balance');
    } finally {
      setLoading(false);
    }
  }, [merchantId, program.id]);

  // Reload on focus so the balance reflects points awarded on the next screen
  useFocusEffect(
    useCallback(() => {
      loadBalance();
    }, [loadBalance]),
  );

  const currency = balance?.currency || program.currency;
  const rows = balance
    ? [
        {label: 'Billing Type', value: formatLabel(balance.billing_type)},
        {label: 'Funding Amount', value: formatMoney(balance.funding_amount, currency)},
        {label: 'Amount Used', value: formatMoney(balance.funded_amount_used, currency)},
        {label: 'Amount Due', value: formatMoney(balance.amount_due, currency)},
        {label: 'Point Value', value: formatMoney(balance.point_value, currency)},
        {label: 'Settlement Status', value: formatLabel(balance.settlement_status)},
        {label: 'Last Updated', value: formatDate(balance.updated_at)},
      ]
    : [];

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <BackIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {program.name || 'Program'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading && !!balance}
            onRefresh={loadBalance}
            tintColor="#8B5CF6"
          />
        }>
        {loading && !balance ? (
          <ActivityIndicator style={styles.loader} color={theme.PRIMARY_COLOR} />
        ) : error && !balance ? (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={loadBalance} activeOpacity={0.7}>
              <Text style={styles.retryText}>Try again</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Remaining balance */}
            <View style={styles.balanceCard}>
              <LinearGradient
                colors={['#885DF5', '#6B7CFE']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.balanceLabel}>Funds Remaining</Text>
              <Text style={styles.balanceValue}>
                {formatMoney(balance?.funded_amount_remaining, currency)}
              </Text>
              {!!program.status && (
                <Text style={styles.balanceSubLabel}>{formatLabel(program.status)} program</Text>
              )}
            </View>

            {/* Breakdown */}
            <View style={styles.card}>
              {rows.map((row, index) => (
                <DetailRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  isLast={index === rows.length - 1}
                />
              ))}
            </View>

            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => navigation.navigate('AwardPoints', {program})}
              activeOpacity={0.85}>
              <Text style={styles.ctaText}>Award Points</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  loader: {
    marginTop: 80,
  },
  balanceCard: {
    borderRadius: 23,
    padding: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  balanceLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  balanceValue: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    color: theme.WHITE,
    marginTop: 8,
  },
  balanceSubLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_PRIMARY,
    marginTop: 8,
  },
  card: {
    backgroundColor: theme.SURFACE_COLOR,
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  rowLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  rowValue: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
    flexShrink: 1,
    textAlign: 'right',
  },
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
  errorState: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  errorText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
  },
  retryText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR,
  },
});

export default ProgramDetails;
