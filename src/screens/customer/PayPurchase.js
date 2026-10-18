import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import {ErrorSheet} from '../../components/ui';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';
import {customerAPI} from '../../services/api';
import {getDashboard} from '../../actions/customerActions';
import useRequest from '../../utilities/useRequest';
import {formatMoney} from '../../utilities/merchantActivity';
import {getSpendableSummary} from '../../utilities/spendable';

const DetailRow = ({label, value, valueStyle, isLast}) => (
  <View style={[styles.row, !isLast && styles.rowBorder]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={[styles.rowValue, valueStyle]}>{value}</Text>
  </View>
);

const PayPurchase = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {purchase} = useRoute().params;
  const merchantId = purchase.merchant_id;

  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState(null);

  const spendable = useRequest(() => customerAPI.getSpendable(merchantId), [merchantId]);
  const summary = getSpendableSummary(spendable.data);
  const amount = Number(purchase.amount) || 0;
  const shortfall = summary.value != null ? amount - summary.value : null;

  const handlePay = async () => {
    setPaying(true);
    try {
      await customerAPI.payWithPoints(merchantId, purchase.id);
      setPaid(true);
      // Points balance on Home changes after paying
      dispatch(getDashboard()).catch(() => {});
    } catch (err) {
      setError(err?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  const rows = [
    {label: 'Merchant', value: purchase.merchant_name || '—'},
    {label: 'Amount', value: formatMoney(purchase.amount, purchase.currency)},
    purchase.reference && {label: 'Reference', value: purchase.reference},
    purchase.note && {label: 'Note', value: purchase.note},
  ].filter(Boolean);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AppHeader title="Pay with Points" showBack onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {paid ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>Payment successful</Text>
            <Text style={styles.successText}>
              You paid {formatMoney(purchase.amount, purchase.currency)} to{' '}
              {purchase.merchant_name || 'the merchant'} with your points.
            </Text>
            <TouchableOpacity
              style={[styles.ctaButton, styles.successButton]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.85}>
              <Text style={styles.ctaText}>Back to Purchases</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>Purchase</Text>
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

            <Text style={styles.sectionTitle}>Your Points</Text>
            <View style={styles.card}>
              {spendable.loading ? (
                <ActivityIndicator style={styles.inlineLoader} color={theme.PRIMARY_COLOR} />
              ) : spendable.error ? (
                <DetailRow label="Spendable here" value="Unavailable" isLast />
              ) : (
                <>
                  <DetailRow label="Spendable here" value={`${summary.points} pts`} />
                  <DetailRow
                    label={`Value (${summary.currency})`}
                    value={
                      summary.value != null ? formatMoney(summary.value, summary.currency) : '—'
                    }
                    isLast={shortfall == null}
                  />
                  {shortfall != null && (
                    <DetailRow
                      label="This purchase"
                      value={
                        shortfall <= 0
                          ? 'Fully covered'
                          : `Short by ${formatMoney(shortfall, summary.currency)}`
                      }
                      valueStyle={shortfall <= 0 ? styles.covered : styles.short}
                      isLast
                    />
                  )}
                </>
              )}
            </View>

            <TouchableOpacity
              style={[styles.ctaButton, paying && styles.disabled]}
              onPress={handlePay}
              disabled={paying}
              activeOpacity={0.85}>
              {paying ? (
                <ActivityIndicator color={theme.WHITE} />
              ) : (
                <Text style={styles.ctaText}>
                  Pay {formatMoney(purchase.amount, purchase.currency)} with Points
                </Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      <ErrorSheet visible={!!error} message={error} onClose={() => setError(null)} />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
    marginBottom: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
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
  covered: {
    color: theme.SUCCESS_COLOR,
  },
  short: {
    color: theme.WARNING_COLOR,
  },
  inlineLoader: {
    paddingVertical: 14,
  },
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
  disabled: {
    opacity: 0.5,
  },
  successCard: {
    backgroundColor: theme.SURFACE_COLOR,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  successText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    marginTop: 8,
    textAlign: 'center',
  },
  successButton: {
    alignSelf: 'stretch',
    marginTop: spacing.xl,
  },
});

export default PayPurchase;
