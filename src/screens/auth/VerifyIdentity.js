import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import {PrimaryButton, StatusIcon} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {customerAPI, safeHavenAPI} from '../../services/api';
import {getProfile} from '../../actions/authActions';
import goToTab from '../../navigations/goToTab';
import useWalletAccount from '../../utilities/useWalletAccount';
import {colors, type, radii} from '../../theme/tokens';

const BVN_LENGTH = 11;
const FAILED = ['FAILED', 'FAILURE', 'MISMATCH', 'INVALID', 'REJECTED', 'NOT_VERIFIED'];

// The verify call is synchronous (async: false); a 2xx reply counts as verified
// unless it says otherwise
const isVerified = data => {
  const d = data?.data ?? data ?? {};
  if (d.verified === false || d.is_verified === false) {
    return false;
  }
  return !FAILED.includes(String(d.status ?? '').toUpperCase());
};

const POINTS = [
  "Your BVN doesn't give access to your bank account",
  'The name must match your Arena profile',
  'Usually done in under a minute',
];

const VerifyIdentity = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const wallet = useWalletAccount();
  const [bvn, setBvn] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [outcome, setOutcome] = useState(null); // 'verified' | 'failed'
  const [setupError, setSetupError] = useState('');

  const handleVerify = async () => {
    setError('');
    try {
      const response = await safeHavenAPI.verifyIdentity({number: bvn});
      const verified = isVerified(response.data);
      setOutcome(verified ? 'verified' : 'failed');
      if (verified) {
        dispatch(getProfile(true)).catch(() => {});
      }
    } catch (err) {
      setError(err.message || "We couldn't reach the verification service. Try again.");
    }
  };

  const handleSetup = async () => {
    setSetupError('');
    try {
      if (!wallet.account.exists) {
        await customerAPI.createWallet();
      }
      goToTab(navigation, 'Wallet');
    } catch (err) {
      setSetupError(err.message || "We couldn't set up your wallet account. Try again.");
    }
  };

  if (outcome) {
    const verified = outcome === 'verified';
    return (
      <FormLayout
        title="Identity verification"
        onBack={() => navigation.goBack()}
        contentStyle={styles.resultContent}
        footer={
          <>
            {!!setupError && (
              <Text style={styles.error} accessibilityRole="alert">
                {setupError}
              </Text>
            )}
            <PrimaryButton
              title={verified ? 'Set up my account' : 'Try again'}
              onPress={verified ? handleSetup : () => setOutcome(null)}
            />
          </>
        }>
        <View style={styles.result} accessibilityRole="alert" accessibilityLiveRegion="polite">
          <StatusIcon status={verified ? 'success' : 'failed'} />
          <Text style={styles.resultTitle}>{verified ? 'Identity verified' : "We couldn't verify this BVN"}</Text>
          <Text style={styles.resultBody}>
            {verified
              ? 'You can now open your wallet account and transfer to any Nigerian bank.'
              : 'Check the number and that the name on it matches your profile, then try again.'}
          </Text>
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="Identity verification"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton title="Verify" onPress={handleVerify} disabled={bvn.length !== BVN_LENGTH} />
        </>
      }>
      <View style={styles.intro}>
        <View style={styles.introIcon}>
          <Icon name="shield" size={26} color={colors.link} />
        </View>
        <Text style={styles.introTitle} accessibilityRole="header">
          Verify with your BVN
        </Text>
        <Text style={styles.introBody}>
          We check your Bank Verification Number with Safe Haven to unlock your wallet account and bank transfers.
        </Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Bank Verification Number</Text>
        <TextInput
          value={bvn}
          onChangeText={text => {
            setBvn(text.replace(/\D/g, '').slice(0, BVN_LENGTH));
            setError('');
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="11 digits"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          maxLength={BVN_LENGTH}
          accessibilityLabel="Bank Verification Number"
          style={[styles.input, (focused || bvn.length === BVN_LENGTH) && styles.inputActive]}
        />
        <Text style={styles.hint}>
          {bvn.length} / {BVN_LENGTH} · Dial *565*0# from your bank phone number to get it
        </Text>
      </View>

      <View style={styles.points}>
        {POINTS.map(point => (
          <View key={point} style={styles.point}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.pointText}>{point}</Text>
          </View>
        ))}
      </View>
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 24,
    gap: 18,
  },
  intro: {
    alignItems: 'center',
    gap: 10,
  },
  introIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(107,78,240,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  introTitle: {
    ...type.statusTitle,
    color: colors.text,
  },
  introBody: {
    ...type.label,
    lineHeight: 18,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 290,
  },
  field: {
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  input: {
    height: 50,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 0,
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 16,
    letterSpacing: 1.9,
    color: colors.text,
  },
  inputActive: {
    borderColor: colors.primary,
  },
  hint: {
    ...type.caption,
    color: colors.textMuted,
  },
  points: {
    padding: 14,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    gap: 6,
  },
  point: {
    flexDirection: 'row',
    gap: 8,
  },
  bullet: {
    ...type.label,
    color: '#D9D9E3',
  },
  pointText: {
    ...type.label,
    flex: 1,
    color: '#D9D9E3',
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
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

export default VerifyIdentity;
