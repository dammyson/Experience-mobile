import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {
  ChoiceGrid,
  ChipGroup,
  InlineField,
  KeyValueCard,
  PrimaryButton,
  StatusScreen,
} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import RedeemableMerchantsField from '../../components/merchant/RedeemableMerchantsField';
import {getMerchantPrograms, getMerchantWallet} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import {useMerchantId, readMerchantProfile} from '../../utilities/merchantData';
import {parseAmount, formatAmountInput} from '../../utilities/transfer';
import {formatNaira} from '../../utilities/format';
import {colors, type, radii} from '../../theme/tokens';

const CAPS = [25, 50, 75, 100];
const LABEL_WIDTH = 112;

const EXPLAIN = {
  PREPAID: 'The funding amount leaves your business wallet now. You can only award points up to what is funded.',
  POSTPAID:
    'Nothing is charged now and there is no cap. When you close the program, your wallet is charged for the value of all points awarded.',
};

const CreateProgram = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {wallet, profile} = useSelector(state => state.merchant);
  const business = readMerchantProfile(profile);
  const currency = profile?.merchant?.currency || wallet?.currency || 'NGN';

  const [step, setStep] = useState(1);
  const [billingType, setBillingType] = useState('PREPAID');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [otherMerchantIds, setOtherMerchantIds] = useState([]);
  const [fundingText, setFundingText] = useState('');
  const [earnText, setEarnText] = useState('1');
  const [valueText, setValueText] = useState('');
  const [cap, setCap] = useState(50);
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  useEffect(() => {
    if (merchantId && !wallet) {
      dispatch(getMerchantWallet(merchantId)).catch(() => {});
    }
  }, [dispatch, merchantId, wallet]);

  // Hardware / gesture back on step 2 returns to step 1
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (step === 2 && !created) {
          e.preventDefault();
          setStep(1);
        }
      }),
    [navigation, step, created],
  );

  const prepaid = billingType === 'PREPAID';
  const funding = parseAmount(fundingText);
  const earn = Number(earnText.replace(/[^\d.]/g, '')) || 0;
  const pointValue = parseAmount(valueText);
  const available = wallet?.available_balance != null ? Number(wallet.available_balance) : null;
  const overFunding = prepaid && available != null && funding > available;

  const redeemableIds = [String(merchantId), ...otherMerchantIds];

  const step1Valid = !!name.trim() && earn > 0 && pointValue > 0 && (!prepaid || funding > 0);

  const handleCreate = async () => {
    setError('');
    try {
      const response = await merchantAPI.createProgram(merchantId, {
        name: name.trim(),
        description: description.trim(),
        billingType,
        currency,
        fundingAmount: funding,
        pointsPerCurrencyUnit: earn,
        pointValue,
        maxRedemptionPercentage: cap,
        redeemableMerchantIds: redeemableIds,
      });
      setCreated(response.data?.program ?? response.data ?? {});
      dispatch(getMerchantPrograms(merchantId, true)).catch(() => {});
      dispatch(getMerchantWallet(merchantId, true)).catch(() => {});
    } catch (err) {
      setError(err.message || "The program couldn't be created.");
    }
  };

  if (created) {
    return (
      <StatusScreen
        headerTitle="New program"
        status="success"
        title={`${name.trim()} is live`}
        body={
          prepaid
            ? `${formatNaira(funding)} moved from your wallet into the program. You can start awarding points.`
            : 'You can start awarding points. Your wallet is charged when you close the program.'
        }
        secondary={{title: 'Done', onPress: () => navigation.goBack()}}
        primary={{
          title: 'Award points',
          onPress: () => navigation.replace('AwardPoints', created.id ? {program: created} : undefined),
        }}
      />
    );
  }

  const rules = [
    {label: 'Billing', value: prepaid ? 'Prepaid' : 'Postpaid'},
    prepaid && {label: 'Funding', value: formatNaira(funding)},
    {label: 'Earning', value: `${earn} pt${earn === 1 ? '' : 's'} per ₦1`},
    {label: 'Value of 1 pt', value: formatNaira(pointValue)},
    {label: 'Max share of a purchase', value: `${cap}%`},
  ];

  if (step === 2) {
    return (
      <FormLayout
        title="New program"
        onBack={() => setStep(1)}
        step={{current: 2, total: 2}}
        contentStyle={styles.content}
        footer={
          <>
            {!!error && (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            )}
            <PrimaryButton
              title={prepaid ? `Create and fund ${formatNaira(funding)}` : 'Create program'}
              onPress={handleCreate}
              disabled={overFunding}
            />
          </>
        }>
        <Text style={styles.heading} accessibilityRole="header">
          Where and when
        </Text>
        <RedeemableMerchantsField
          merchantId={merchantId}
          businessName={business.name}
          value={otherMerchantIds}
          onChange={setOtherMerchantIds}
        />
        {/* Only these values are documented today (README gap 8); offer choices once the API supports them */}
        <KeyValueCard
          rows={[
            {label: 'Who can redeem', value: 'Private · your customers'},
            {label: 'Expiry', value: 'Never'},
          ]}
        />
        <KeyValueCard title={name.trim()} rows={rules} />
        {overFunding && (
          <View style={styles.warn} accessibilityRole="alert">
            <Icon name="alert" size={18} color={colors.danger} />
            <Text style={styles.warnText}>
              Your wallet has {formatNaira(available)}. Fund it from Business before creating this program, or lower
              the funding.
            </Text>
          </View>
        )}
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="New program"
      onBack={() => navigation.goBack()}
      step={{current: 1, total: 2}}
      contentStyle={styles.content}
      footer={
        <>
          <Text style={styles.helper}>Next: where points can be spent and when they expire.</Text>
          <PrimaryButton title="Continue" onPress={() => setStep(2)} disabled={!step1Valid} />
        </>
      }>
      <ChoiceGrid
        prompt="How do you want to pay for points?"
        options={[
          {id: 'PREPAID', label: 'Prepaid', icon: <Icon name="wallet" size={22} color={colors.text} />},
          {id: 'POSTPAID', label: 'Postpaid', icon: <Icon name="receipt" size={22} color={colors.text} />},
        ]}
        value={billingType}
        onChange={setBillingType}
        tileHeight={84}
      />
      <Text style={styles.explain}>{EXPLAIN[billingType]}</Text>

      <View style={styles.fields}>
        <InlineField label="Program name:" labelWidth={LABEL_WIDTH} value={name} onChangeText={setName} maxLength={60} />
        <InlineField
          label="Description:"
          labelWidth={LABEL_WIDTH}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional"
          maxLength={160}
        />
        {prepaid && (
          <InlineField
            label="Funding:"
            labelWidth={LABEL_WIDTH}
            value={fundingText}
            onChangeText={text => setFundingText(formatAmountInput(text))}
            placeholder="₦0"
            keyboardType="decimal-pad"
            strong
            valid={funding > 0}
            error={overFunding ? `More than your wallet balance (${formatNaira(available)}).` : undefined}
          />
        )}
        <InlineField
          label="Points per ₦1:"
          labelWidth={LABEL_WIDTH}
          value={earnText}
          onChangeText={text => setEarnText(text.replace(/[^\d.]/g, ''))}
          keyboardType="decimal-pad"
        />
        <InlineField
          label="Value of 1 pt:"
          labelWidth={LABEL_WIDTH}
          value={valueText}
          onChangeText={text => setValueText(formatAmountInput(text))}
          placeholder="₦0.50"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.capGroup}>
        <Text style={styles.label}>Max share of a purchase payable with points</Text>
        <ChipGroup
          options={CAPS.map(v => ({id: v, label: `${v}%`}))}
          value={cap}
          onChange={setCap}
          equal
          filled
          accessibilityLabel="Maximum redemption"
        />
      </View>
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 16,
    gap: 14,
  },
  heading: {
    ...type.sectionHeading,
    color: colors.text,
  },
  explain: {
    ...type.label,
    lineHeight: 18,
    color: '#D9D9E3',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: 'rgba(107,78,240,0.10)',
    borderWidth: 1,
    borderColor: '#3A2E6E',
    overflow: 'hidden',
  },
  fields: {
    gap: 12,
  },
  capGroup: {
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  helper: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  warn: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: 'rgba(245,142,155,0.08)',
    borderWidth: 1,
    borderColor: '#5A2A33',
  },
  warnText: {
    ...type.label,
    flex: 1,
    lineHeight: 18,
    color: '#F7C4CB',
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default CreateProgram;
