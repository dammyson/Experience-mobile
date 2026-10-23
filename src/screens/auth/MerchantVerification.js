import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {AppInput, ChipGroup, PrimaryButton, StatusIcon} from '../../components/ui';
import {merchantAPI} from '../../services/api';
import {getMerchantProfile, getMerchantWallet} from '../../actions/merchantActions';
import {useMerchantId} from '../../utilities/merchantData';
import {colors, type} from '../../theme/tokens';

// TODO: confirm the full list of registration types with the backend
const REGISTRATION_TYPES = [
  // {id: 'CAC', label: 'CAC', field: 'RC number', hint: 'Your CAC registration number, e.g. 1234567'},
  {id: 'BVN', label: 'BVN', field: 'BVN', hint: '11 digits · Dial *565*0# to get it', length: 11},
];

const FAILED = ['FAILED', 'FAILURE', 'REJECTED', 'MISMATCH', 'NAME_MISMATCH', 'INVALID', 'NOT_VERIFIED'];

// The verify call is synchronous (async_flag: false); a 2xx reply counts as
// verified unless it says otherwise
const isVerified = data => {
  const d = data ?? {};
  if (d.verified === false || d.is_verified === false) {
    return false;
  }
  return !FAILED.includes(String(d.status ?? '').toUpperCase());
};

const MerchantVerification = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();

  const [registrationType, setRegistrationType] = useState('CAC');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [companyName, setCompanyName] = useState(route.params?.businessName || '');
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState(null); // {status: 'verified' | 'failed', message}
  const [walletError, setWalletError] = useState('');

  const selectedType = REGISTRATION_TYPES.find(t => t.id === registrationType);
  const numberValid = selectedType.length
    ? registrationNumber.length === selectedType.length
    : !!registrationNumber.trim();

  // Opened from the home screen it can go back; straight after registration
  // there's nothing behind it
  const canGoBack = navigation.canGoBack();
  const goToApp = () =>
    canGoBack ? navigation.goBack() : navigation.reset({index: 0, routes: [{name: 'TabsNavigation'}]});

  const handleVerify = async () => {
    setError('');
    try {
      const response = await merchantAPI.verifyCompany(merchantId, {
        registrationType,
        registrationNumber: registrationNumber.trim(),
        companyName: companyName.trim(),
      });
      const verified = isVerified(response.data);
      setOutcome(
        verified
          ? {status: 'verified'}
          : {status: 'failed', message: response.data?.message},
      );
      if (verified) {
        dispatch(getMerchantProfile(merchantId, true)).catch(() => {});
      }
    } catch (err) {
      setError(err.message || "We couldn't reach the verification service. Try again.");
    }
  };

  const handleCreateWallet = async () => {
    setWalletError('');
    try {
      await merchantAPI.createWallet(merchantId);
      // The profile's bank account is what marks the wallet as created
      dispatch(getMerchantProfile(merchantId, true))
        .then(() => dispatch(getMerchantWallet(merchantId, true)))
        .catch(() => {});
      goToApp();
    } catch (err) {
      setWalletError(err.message || "We couldn't create your wallet. Try again.");
    }
  };

  const skipLink = (
    <TouchableOpacity onPress={goToApp} accessibilityRole="button" style={styles.skip}>
      <Text style={styles.skipText}>Skip for now</Text>
    </TouchableOpacity>
  );

  if (outcome) {
    const verified = outcome.status === 'verified';
    return (
      <FormLayout
        title="Verify your business"
        contentStyle={styles.resultContent}
        footer={
          <>
            {!!walletError && (
              <Text style={styles.error} accessibilityRole="alert">
                {walletError}
              </Text>
            )}
            <PrimaryButton
              title={verified ? 'Create wallet' : 'Try again'}
              onPress={verified ? handleCreateWallet : () => setOutcome(null)}
            />
            {skipLink}
          </>
        }>
        <View style={styles.result} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <StatusIcon status={verified ? 'success' : 'failed'} />
          <Text style={styles.resultTitle}>
            {verified ? `${companyName.trim()} is verified` : "We couldn't verify your business"}
          </Text>
          <Text style={styles.resultBody}>
            {verified
              ? 'Create your business wallet to fund loyalty programs and receive payments.'
              : outcome.message || `Check the ${selectedType.field} and company name, then try again.`}
          </Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="Verify your business"
      onBack={canGoBack ? () => navigation.goBack() : undefined}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton
            title="Verify business"
            onPress={handleVerify}
            disabled={!merchantId || !numberValid || !companyName.trim()}
          />
          {!canGoBack && skipLink}
        </>
      }>
      <Text style={styles.heading} accessibilityRole="header">
        Company verification
      </Text>
      <Text style={styles.intro}>Verify your business to unlock your wallet and start running loyalty programs.</Text>

      <View style={styles.group}>
        <Text style={styles.label}>Registration type</Text>
        <ChipGroup
          options={REGISTRATION_TYPES}
          value={registrationType}
          onChange={id => {
            setRegistrationType(id);
            setRegistrationNumber('');
            setError('');
          }}
          size="md"
          accessibilityLabel="Registration type"
        />
      </View>

      <View style={styles.group}>
        <AppInput
          label={selectedType.field}
          value={registrationNumber}
          onChangeText={text => {
            setError('');
            setRegistrationNumber(
              selectedType.length ? text.replace(/\D/g, '').slice(0, selectedType.length) : text,
            );
          }}
          keyboardType={selectedType.length ? 'number-pad' : 'default'}
          autoCapitalize="characters"
          autoCorrect={false}
        />
        <Text style={styles.hint}>{selectedType.hint}</Text>
      </View>

      <AppInput
        label="Registered company name"
        value={companyName}
        onChangeText={text => {
          setError('');
          setCompanyName(text);
        }}
        autoCapitalize="words"
      />
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    gap: 12,
  },
  heading: {
    ...type.sectionHeading,
    color: colors.text,
  },
  intro: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
  },
  group: {
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  hint: {
    ...type.caption,
    color: colors.textMuted,
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
  skip: {
    alignSelf: 'center',
    paddingVertical: 8,
  },
  skipText: {
    ...type.bodyStrong,
    color: colors.link,
  },
  resultContent: {
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  result: {
    alignItems: 'center',
    gap: 12,
  },
  resultTitle: {
    ...type.statusTitle,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  resultBody: {
    ...type.label,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default MerchantVerification;
