import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {Button} from '../ui';
import Icon from '../icons/Icon';
import {merchantAPI} from '../../services/api';
import {getMerchantProfile, getMerchantWallet} from '../../actions/merchantActions';
import {useMerchantId} from '../../utilities/merchantData';
import {colors, type, radii} from '../../theme/tokens';

const COPY = {
  verify: {
    icon: 'shield',
    title: 'Verify your business',
    body: 'Complete company verification to unlock your business wallet.',
    action: 'Complete verification',
  },
  create: {
    icon: 'plus',
    title: 'Create your wallet',
    body: 'Your business is verified. Create a wallet to fund programs and receive payments.',
    action: 'Create wallet',
  },
};

/**
 * Shown where the business wallet would be when the merchant can't have one yet.
 *
 * Props:
 *   mode          'verify' (company not verified) | 'create' (verified, no wallet)
 *   businessName  string — prefills the verification form
 */
const WalletSetupCard = ({mode, businessName}) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const [error, setError] = useState('');
  const copy = COPY[mode];

  const handleCreate = async () => {
    setError('');
    try {
      await merchantAPI.createWallet(merchantId);
      // The profile's bank account is what marks the wallet as created
      await dispatch(getMerchantProfile(merchantId, true));
      await dispatch(getMerchantWallet(merchantId, true));
    } catch (err) {
      setError(err.message || "We couldn't create your wallet. Try again.");
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Icon name={copy.icon} size={20} color={colors.link} />
        </View>
        <View style={styles.text}>
          <Text style={styles.title} accessibilityRole="header">
            {copy.title}
          </Text>
          <Text style={styles.body}>{copy.body}</Text>
        </View>
      </View>
      {!!error && (
        <Text style={styles.error} accessibilityRole="alert">
          {error}
        </Text>
      )}
      <Button
        title={copy.action}
        size="md"
        onPress={
          mode === 'create'
            ? handleCreate
            : () => navigation.navigate('MerchantVerification', {businessName})
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    gap: 13,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(107,78,240,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 4,
  },
  title: {
    ...type.sectionHeading,
    color: colors.text,
  },
  body: {
    ...type.label,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
  },
});

export default WalletSetupCard;
