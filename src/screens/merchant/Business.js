import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {BalanceCard, Button, InlineField, KeyValueList, SkeletonCard} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import WalletSetupCard from '../../components/merchant/WalletSetupCard';
import {getMerchantProfile, getMerchantWallet} from '../../actions/merchantActions';
import {logout} from '../../actions/authActions';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {readWalletAccount} from '../../utilities/customerData';
import {
  useMerchantId,
  readMerchantProfile,
  readMerchantBankAccount,
  isCompanyVerified,
  hasMerchantWallet,
} from '../../utilities/merchantData';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const LinkRow = ({label, value, onPress, danger, first}) => {
  const Container = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole={onPress ? 'button' : undefined}
      accessible
      accessibilityLabel={[label, value].filter(Boolean).join(', ')}
      style={[styles.linkRow, !first && styles.linkBorder]}>
      <Text style={[styles.linkLabel, danger && styles.linkDanger]}>{label}</Text>
      {!!value && <Text style={styles.linkValue}>{value}</Text>}
      {!!onPress && !danger && <Icon name="chevronRight" size={16} color={colors.textMuted} />}
    </Container>
  );
};

const Business = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {wallet, walletLoading, profile, profileLoading, error} = useSelector(state => state.merchant);
  const companyVerified = isCompanyVerified(profile);
  const hasWallet = hasMerchantWallet(profile);
  const safeHaven = useRequest(
    () =>
      merchantId && companyVerified ? merchantAPI.getAccountBalance(merchantId) : Promise.resolve({data: null}),
    [merchantId, companyVerified],
  );

  const [rcNumber, setRcNumber] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [verification, setVerification] = useState(null); // {status: 'verified' | 'failed', message}

  const load = useCallback(
    (force = false) => {
      if (merchantId) {
        dispatch(getMerchantProfile(merchantId, force)).catch(() => {});
        dispatch(getMerchantWallet(merchantId, force)).catch(() => {});
      }
    },
    [dispatch, merchantId],
  );

  useEffect(() => {
    load();
  }, [load]);

  // getMerchantWallet skips the call until the profile says the company is verified
  useEffect(() => {
    if (merchantId && companyVerified && hasWallet) {
      dispatch(getMerchantWallet(merchantId)).catch(() => {});
    }
  }, [dispatch, merchantId, companyVerified, hasWallet]);

  const business = readMerchantProfile(profile);
  const account = readWalletAccount(wallet, safeHaven.data);
  const bankAccount = readMerchantBankAccount(profile);
  const verified = business.verified || companyVerified || verification?.status === 'verified';

  const handleVerify = async () => {
    try {
      const response = await merchantAPI.verifyCompany(merchantId, {
        registrationNumber: rcNumber.trim(),
        companyName: companyName.trim(),
      });
      const status = String(response.data?.status ?? '').toUpperCase();
      const failed = ['FAILED', 'REJECTED', 'MISMATCH', 'NAME_MISMATCH', 'INVALID'].includes(status);
      setVerification(
        failed
          ? {status: 'failed', message: response.data?.message || 'The details didn’t match CAC records.'}
          : {status: 'verified'},
      );
      if (!failed) {
        load(true);
      }
    } catch (err) {
      setVerification({status: 'failed', message: err.message || 'Verification failed. Check the details and try again.'});
    }
  };

  // Balance card refresh: profile first, since it gates the wallet call
  const refreshWallet = () =>
    Promise.all([
      dispatch(getMerchantProfile(merchantId, true)).then(() => dispatch(getMerchantWallet(merchantId, true))),
      safeHaven.refresh(),
    ]);

  const copyAccountNumber = () => {
    Clipboard.setString(bankAccount.number);
    showMessage({message: 'Account number copied', type: 'success'});
  };

  const handleSignOut = async () => {
    await dispatch(logout());
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Business" root />
      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: TAB_SCROLL_INSET}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => {
              load(true);
              safeHaven.refresh();
            }}
            tintColor={colors.link}
          />
        }>
        {(profileLoading && !profile) || (walletLoading && !wallet) ? (
          <SkeletonCard height={190} />
        ) : !profile && error ? (
          <RequestState error={error} onRetry={() => load(true)} />
        ) : !companyVerified ? (
          <WalletSetupCard mode="verify" businessName={business.name} />
        ) : !hasWallet ? (
          <WalletSetupCard mode="create" />
        ) : !wallet && error ? (
          <RequestState error={error} onRetry={() => load(true)} />
        ) : (
          <BalanceCard
            label="Business wallet"
            amount={wallet?.available_balance ?? 0}
            currency={wallet?.currency}
            right={
              !safeHaven.error && (
                <View style={styles.activeChip}>
                  <Text style={styles.activeText}>Account active</Text>
                </View>
              )
            }
            account={account.number ? {bank: account.bank, name: account.name || business.name, number: account.number} : null}
            onRefresh={refreshWallet}
          />
        )}

        {!!bankAccount && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} accessibilityRole="header">
                Bank account
              </Text>
              <View style={[styles.verifiedChip, !bankAccount.active && styles.inactiveChip]}>
                <Text style={[styles.verifiedText, !bankAccount.active && styles.inactiveText]}>
                  {bankAccount.status}
                </Text>
              </View>
            </View>
            <View style={styles.accountRow}>
              <View style={styles.accountText}>
                <Text style={styles.cardHint}>Account number</Text>
                <Text style={styles.accountNumber} selectable>
                  {bankAccount.number.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={copyAccountNumber}
                style={styles.copyBtn}
                accessibilityRole="button"
                accessibilityLabel="Copy account number"
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <Icon name="copy" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
            <KeyValueList
              rows={[
                {label: 'Bank', value: bankAccount.bank},
                bankAccount.name && {label: 'Account name', value: bankAccount.name},
                {label: 'Currency', value: bankAccount.currency},
              ]}
            />
            <Text style={styles.cardHint}>Transfer to this account to fund your business wallet.</Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} accessibilityRole="header">
              Company verification
            </Text>
            {verified && (
              <View style={styles.verifiedChip}>
                <Icon name="check" size={12} color={colors.successText} strokeWidth={2.6} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>

          {verified ? (
            <KeyValueList
              rows={[
                {label: 'Registration type', value: business.registrationType || 'CAC'},
                (business.registrationNumber || rcNumber) && {
                  label: 'RC number',
                  value: business.registrationNumber || rcNumber,
                },
                (business.companyName || companyName) && {label: 'Company name', value: business.companyName || companyName},
              ]}
            />
          ) : (
            <>
              <Text style={styles.cardHint}>Verify your business with its CAC registration number.</Text>
              <InlineField label="RC number:" labelWidth={100} value={rcNumber} onChangeText={setRcNumber} autoCapitalize="characters" />
              <InlineField label="Company name:" labelWidth={100} value={companyName} onChangeText={setCompanyName} />
              {verification?.status === 'failed' && (
                <Text style={styles.error} accessibilityRole="alert">
                  {verification.message}
                </Text>
              )}
              <Button
                title="Verify company"
                size="md"
                onPress={handleVerify}
                disabled={!rcNumber.trim() || !companyName.trim()}
              />
            </>
          )}
          {/* No verification history endpoint yet, so past attempts aren't listed */}
        </View>

        <View style={styles.links}>
          <LinkRow first label="Promotions & giveaways" onPress={() => navigation.navigate('Promotions')} />
          {/* README: business profile is read-only; no edit endpoint */}
          <LinkRow label="Business profile" value="View only" />
          <LinkRow label="Sign out" danger onPress={handleSignOut} />
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingHorizontal: layout.screenPadding,
    gap: 18,
  },
  activeChip: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(10,10,15,0.3)',
  },
  activeText: {
    ...type.captionStrong,
    color: '#7FF0C8',
  },
  card: {
    padding: 16,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...type.sectionHeading,
    color: colors.text,
  },
  cardHint: {
    ...type.label,
    color: colors.textSecondary,
  },
  verifiedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.successBg,
  },
  verifiedText: {
    ...type.captionStrong,
    color: colors.successText,
  },
  inactiveChip: {
    backgroundColor: colors.surfaceRaised,
  },
  inactiveText: {
    color: colors.textMuted,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accountText: {
    flex: 1,
    gap: 4,
  },
  accountNumber: {
    fontFamily: type.balance.fontFamily,
    fontSize: 20,
    letterSpacing: 0.5,
    color: colors.text,
  },
  copyBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.input,
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
  },
  links: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },
  linkRow: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
  },
  linkLabel: {
    ...type.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  linkDanger: {
    color: colors.danger,
  },
  linkValue: {
    ...type.caption,
    color: colors.textMuted,
  },
});

export default Business;
