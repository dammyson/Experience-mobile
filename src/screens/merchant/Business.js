import React, {useCallback, useEffect, useState} from 'react';
import {View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {BalanceCard, Button, ConfirmSheet, InlineField, KeyValueList, SkeletonCard} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {getMerchantProfile, getMerchantWallet} from '../../actions/merchantActions';
import {logout} from '../../actions/authActions';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {readWalletAccount} from '../../utilities/customerData';
import {useMerchantId, readMerchantProfile} from '../../utilities/merchantData';
import {parseAmount, formatAmountInput} from '../../utilities/transfer';
import {formatNaira} from '../../utilities/format';
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
  const {wallet, walletLoading, profile, error} = useSelector(state => state.merchant);
  const safeHaven = useRequest(
    () => (merchantId ? merchantAPI.getAccountBalance(merchantId) : Promise.resolve({data: null})),
    [merchantId],
  );

  const [fundOpen, setFundOpen] = useState(false);
  const [fundText, setFundText] = useState('');
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

  const business = readMerchantProfile(profile);
  const account = readWalletAccount(wallet, safeHaven.data);
  const verified = business.verified || verification?.status === 'verified';
  const fundAmount = parseAmount(fundText);

  const handleFund = async () => {
    try {
      await merchantAPI.fundWallet(merchantId, {amount: fundAmount});
      setFundOpen(false);
      setFundText('');
      // The fund response doesn't say whether money has settled, so don't claim it has
      showMessage({message: `Funding of ${formatNaira(fundAmount)} submitted`, type: 'success'});
      load(true);
      safeHaven.refresh();
    } catch (err) {
      setFundOpen(false);
      showMessage({message: err.message || "The wallet couldn't be funded.", type: 'danger'});
    }
  };

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
        {walletLoading && !wallet ? (
          <SkeletonCard height={190} />
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
            account={account.number ? {bank: account.bank, name: account.name || business.name, number: account.number} : null}>
            <TouchableOpacity
              style={styles.fundBtn}
              onPress={() => setFundOpen(true)}
              accessibilityRole="button"
              activeOpacity={0.85}>
              <Icon name="plus" size={16} color={colors.white} strokeWidth={2.2} />
              <Text style={styles.fundText}>Fund wallet</Text>
            </TouchableOpacity>
          </BalanceCard>
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
                {label: 'Registration type', value: 'CAC'},
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

      <ConfirmSheet
        visible={fundOpen}
        title="Fund wallet"
        hero={
          <InlineField
            label="Amount:"
            labelWidth={76}
            value={fundText}
            onChangeText={text => setFundText(formatAmountInput(text))}
            placeholder="₦0"
            keyboardType="decimal-pad"
            strong
            valid={fundAmount > 0}
          />
        }
        note="Your balance updates once the funding is confirmed."
        editLabel="Cancel"
        confirmLabel={fundAmount > 0 ? `Fund ${formatNaira(fundAmount)}` : 'Fund'}
        confirmDisabled={!(fundAmount > 0)}
        onConfirm={handleFund}
        onClose={() => setFundOpen(false)}
      />
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
  fundBtn: {
    height: 44,
    borderRadius: radii.input,
    backgroundColor: 'rgba(10,10,15,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fundText: {
    ...type.bodyStrong,
    color: colors.white,
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
