import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {AppInput, ErrorSheet} from '../../components/ui';
import CustomerLookup, {getCustomerName} from '../../components/merchant/CustomerLookup';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';
import {merchantAPI} from '../../services/api';
import {getRecentMerchantActivities, getMerchantWallet} from '../../actions/merchantActions';
import {formatMoney} from '../../utilities/merchantActivity';

const newReference = () => `PURCHASE-${Date.now()}`;

// Digits with at most one decimal point and two decimal places
const sanitizeAmount = text => {
  const cleaned = text.replace(/[^0-9.]/g, '');
  const [whole, ...rest] = cleaned.split('.');
  return rest.length ? `${whole}.${rest.join('').slice(0, 2)}` : whole;
};

const CreateOrder = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {user} = useSelector(state => state.auth);
  const wallet = useSelector(state => state.merchant.wallet);
  const merchantId = user?.merchant_ids?.[0];
  const currency = wallet?.currency || 'NGN';

  const [lookupKey, setLookupKey] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState(newReference);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState(null);

  const amountValue = parseFloat(amount);
  const canSubmit = !!customer && amountValue > 0 && !!reference.trim() && !submitting;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await merchantAPI.createPurchase(merchantId, {
        customerId: customer.id,
        amount: amountValue,
        currency,
        reference: reference.trim(),
        note: note.trim(),
      });
      setCompleted(true);
      // Keep the home screen's activity feed and wallet in sync
      dispatch(getRecentMerchantActivities(merchantId)).catch(() => {});
      dispatch(getMerchantWallet(merchantId)).catch(() => {});
    } catch (err) {
      setError(err?.message || 'Failed to create order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnother = () => {
    setLookupKey(key => key + 1);
    setCustomer(null);
    setAmount('');
    setReference(newReference());
    setNote('');
    setCompleted(false);
  };

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
        <Text style={styles.headerTitle}>Create Order</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {completed ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>Order created</Text>
              <Text style={styles.successText}>
                {formatMoney(amountValue, currency)} purchase recorded for{' '}
                {getCustomerName(customer)}.
              </Text>
              <Text style={styles.successReference}>Ref: {reference}</Text>

              <TouchableOpacity
                style={[styles.ctaButton, styles.successButton]}
                onPress={handleCreateAnother}
                activeOpacity={0.85}>
                <Text style={styles.ctaText}>Create Another Order</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={styles.linkText}>Back to Home</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Step 1 — find customer */}
              <CustomerLookup
                key={lookupKey}
                merchantId={merchantId}
                customer={customer}
                onCustomerChange={setCustomer}
                onError={setError}
              />

              {/* Step 2 — order details */}
              {customer && (
                <>
                  <Text style={styles.sectionTitle}>Order Details</Text>

                  <AppInput
                    label={`Amount (${currency})`}
                    value={amount}
                    onChangeText={text => setAmount(sanitizeAmount(text))}
                    placeholder="e.g. 5000"
                    keyboardType="decimal-pad"
                  />

                  <View style={styles.spacer} />

                  <AppInput
                    label="Reference"
                    value={reference}
                    onChangeText={setReference}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />

                  <View style={styles.spacer} />

                  <AppInput
                    label="Note (optional)"
                    value={note}
                    onChangeText={setNote}
                    placeholder="e.g. counter purchase"
                  />

                  <TouchableOpacity
                    style={[styles.ctaButton, !canSubmit && styles.disabled]}
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    activeOpacity={0.85}>
                    {submitting ? (
                      <ActivityIndicator color={theme.WHITE} />
                    ) : (
                      <Text style={styles.ctaText}>
                        Create Order
                        {amountValue > 0 ? ` · ${formatMoney(amountValue, currency)}` : ''}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorSheet visible={!!error} message={error} onClose={() => setError(null)} />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
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
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginBottom: 12,
  },
  spacer: {
    height: 20,
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
  successReference: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    marginTop: 6,
  },
  successButton: {
    alignSelf: 'stretch',
  },
  linkText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR,
    marginTop: 16,
  },
});

export default CreateOrder;
