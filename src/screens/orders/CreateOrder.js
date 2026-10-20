import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {Button, InlineField, PrimaryButton, StatusScreen} from '../../components/ui';
import CustomerFinder, {FoundCustomerCard} from '../../components/merchant/CustomerFinder';
import {merchantAPI} from '../../services/api';
import {getRecentMerchantActivities, getMerchantWallet} from '../../actions/merchantActions';
import {useMerchantId, customerName} from '../../utilities/merchantData';
import {parseAmount, formatAmountInput} from '../../utilities/transfer';
import {formatNaira} from '../../utilities/format';
import {isNetworkError} from '../../utilities/errors';
import {colors, type} from '../../theme/tokens';

const newReference = () => `PURCHASE-${Date.now()}`;
const LABEL_WIDTH = 92;

/**
 * Record a purchase for a customer so they can pay it with points.
 * Not in the design files; built from the shared components.
 */
const CreateOrder = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const wallet = useSelector(state => state.merchant.wallet);
  const currency = wallet?.currency || 'NGN';

  const [finderKey, setFinderKey] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [amountText, setAmountText] = useState('');
  const [reference, setReference] = useState(newReference);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const amount = parseAmount(amountText);
  const valid = !!customer && amount > 0 && !!reference.trim();

  const handleSubmit = async () => {
    setError('');
    try {
      await merchantAPI.createPurchase(merchantId, {
        customerId: customer.id,
        amount,
        currency,
        reference: reference.trim(),
        note: note.trim(),
      });
      setResult('success');
      // Keep the overview's activity feed and wallet in sync
      dispatch(getRecentMerchantActivities(merchantId)).catch(() => {});
      dispatch(getMerchantWallet(merchantId)).catch(() => {});
    } catch (err) {
      if (isNetworkError(err)) {
        setResult('pending');
      } else {
        setError(err.message || "The purchase couldn't be created.");
      }
    }
  };

  const startOver = () => {
    setFinderKey(k => k + 1);
    setCustomer(null);
    setAmountText('');
    setReference(newReference());
    setNote('');
    setResult(null);
  };

  if (result) {
    const success = result === 'success';
    return (
      <StatusScreen
        headerTitle="New purchase"
        status={success ? 'success' : 'pending'}
        title={success ? 'Purchase created' : "We couldn't confirm the purchase"}
        body={
          success
            ? `${customerName(customer)} can now pay ${formatNaira(amount, {currency})} with points from their app.`
            : 'We lost connection before the server replied. Check Activity before creating it again.'
        }
        details={[
          {label: 'Customer', value: customerName(customer)},
          {label: 'Amount', value: formatNaira(amount, {currency})},
          {label: 'Reference', value: reference.trim()},
          !!note.trim() && {label: 'Note', value: note.trim()},
        ]}
        secondary={{title: 'Done', onPress: () => navigation.goBack()}}
        primary={{title: 'New purchase', onPress: startOver}}
      />
    );
  }

  return (
    <FormLayout
      title="New purchase"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        customer && (
          <>
            {!!error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
            <PrimaryButton
              title={amount > 0 ? `Create purchase · ${formatNaira(amount, {currency})}` : 'Create purchase'}
              onPress={handleSubmit}
              disabled={!valid}
            />
          </>
        )
      }>
      {customer ? (
        <>
          <FoundCustomerCard customer={customer}>
            <View style={styles.change}>
              <Button title="Change customer" variant="secondary" size="sm" onPress={startOver} />
            </View>
          </FoundCustomerCard>

          <View style={styles.fields}>
            <InlineField
              label="Amount:"
              labelWidth={LABEL_WIDTH}
              value={amountText}
              onChangeText={text => setAmountText(formatAmountInput(text))}
              placeholder="₦0"
              keyboardType="decimal-pad"
              strong
              valid={amount > 0}
            />
            <InlineField
              label="Reference:"
              labelWidth={LABEL_WIDTH}
              value={reference}
              onChangeText={setReference}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <InlineField
              label="Note:"
              labelWidth={LABEL_WIDTH}
              value={note}
              onChangeText={setNote}
              placeholder="Optional"
              maxLength={120}
            />
          </View>
          <Text style={styles.helper}>The customer pays this in full with points from their app.</Text>
        </>
      ) : (
        <CustomerFinder
          key={finderKey}
          merchantId={merchantId}
          renderFound={found => (
            <View style={styles.flex}>
              <Button title="Use this customer" size="sm" onPress={() => setCustomer(found)} />
            </View>
          )}
          missingHint={identifier =>
            `Purchases need an existing customer. Check the ${identifier.short}, or ask them to sign up first.`
          }
          renderMissing={() => null}
        />
      )}
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  change: {
    flex: 1,
  },
  fields: {
    gap: 12,
  },
  helper: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default CreateOrder;
