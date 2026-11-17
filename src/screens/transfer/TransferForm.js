import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, Switch, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {
  ChipGroup,
  ConfirmSheet,
  InlineField,
  inlineFieldBox,
  PasswordInput,
  PickerSheet,
  PrimaryButton,
  SkeletonList,
} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {safeHavenAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {readBanks, readNameEnquiry, parseAmount, formatAmountInput} from '../../utilities/transfer';
import {formatNaira} from '../../utilities/format';
import {isNetworkError} from '../../utilities/errors';
import {colors, type, radii} from '../../theme/tokens';

const QUICK = [5000, 10000, 25000, 50000];
const LABEL_WIDTH = 100;

/**
 * Send money to any Nigerian bank account: pick a bank, enter a 10-digit
 * account number (the name is looked up automatically), set an amount, then
 * confirm. Shared by customer transfers and merchant withdrawals.
 *
 * Props:
 *   title               string
 *   source              {loading, error, reload, balance, currency, ready}
 *   notReady            ReactNode — shown instead of the form when !source.ready
 *   showSaveBeneficiary boolean
 *   requirePassword     boolean — ask for the account password in the confirm sheet
 *   submit              ({bank, accountNumber, sessionId, amount, narration,
 *                         saveBeneficiary, password}) => Promise<{status, reference}>
 *                       A 403 with requirePassword keeps the sheet open as a wrong password.
 *   retryRoute          route TransferStatus's "Try again" goes back to
 *   doneTab             tab TransferStatus's primary button goes to
 */
const TransferForm = ({
  title,
  source,
  notReady,
  showSaveBeneficiary = false,
  requirePassword = false,
  submit,
  retryRoute,
  doneTab,
}) => {
  const navigation = useNavigation();
  const banksReq = useRequest(() => safeHavenAPI.getBanks(), []);
  const banks = useMemo(() => readBanks(banksReq.data), [banksReq.data]);

  const [bank, setBank] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [accountNumber, setAccountNumber] = useState('');
  const [enquiry, setEnquiry] = useState({status: 'idle'});
  const [amountText, setAmountText] = useState('');
  const [narration, setNarration] = useState('');
  const [saveBeneficiary, setSaveBeneficiary] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState(null);

  const balance = source.balance ?? 0;
  const currency = source.currency;
  const amount = parseAmount(amountText);
  const over = amount > balance;

  // Look up the account name once a bank and a full 10-digit number are set
  useEffect(() => {
    if (!bank || accountNumber.length !== 10) {
      setEnquiry({status: 'idle'});
      return undefined;
    }
    let cancelled = false;
    setEnquiry({status: 'loading'});
    safeHavenAPI
      .nameEnquiry({bankCode: bank.id, accountNumber})
      .then(response => {
        if (cancelled) {
          return;
        }
        const {name, sessionId} = readNameEnquiry(response.data);
        setEnquiry(
          name && sessionId
            ? {status: 'ok', name, sessionId}
            : {status: 'error', message: "We couldn't find this account."},
        );
      })
      .catch(err => {
        if (!cancelled) {
          setEnquiry({status: 'error', message: err.message || "We couldn't verify this account."});
        }
      });
    return () => {
      cancelled = true;
    };
  }, [bank, accountNumber]);

  const valid = enquiry.status === 'ok' && amount > 0 && !over && source.ready;

  const openSheet = () => {
    setPassword('');
    setPasswordError(null);
    setSheetOpen(true);
  };

  const handleSend = async () => {
    const details = {
      amount,
      currency,
      name: enquiry.name,
      bankName: bank.label,
      accountNumber,
      narration: narration.trim(),
      retryRoute,
      doneTab,
    };
    try {
      const {status, reference} = await submit({
        bank,
        accountNumber,
        sessionId: enquiry.sessionId,
        amount,
        narration: narration.trim(),
        saveBeneficiary: showSaveBeneficiary && saveBeneficiary,
        password,
      });
      setSheetOpen(false);
      navigation.replace('TransferStatus', {...details, reference, status});
    } catch (err) {
      if (requirePassword && err.status === 403) {
        setPasswordError(err.message || 'Incorrect password');
        return;
      }
      setSheetOpen(false);
      navigation.replace('TransferStatus', {
        ...details,
        // No response means the transfer may still have gone through
        status: isNetworkError(err) ? 'unknown' : 'failed',
        message: err.message,
      });
    }
  };

  let body;
  if (source.loading || banksReq.loading) {
    body = <SkeletonList rows={4} />;
  } else if (source.error) {
    body = <RequestState error={source.error} onRetry={source.reload} />;
  } else if (!source.ready) {
    body = notReady;
  } else if (banksReq.error) {
    body = <RequestState error={banksReq.error} onRetry={banksReq.reload} />;
  } else {
    body = (
      <>
        <Text style={styles.balance}>Current balance: {formatNaira(balance, {currency})}</Text>

        <View style={styles.fields}>
          <InlineField label="Select bank:" labelWidth={LABEL_WIDTH}>
            <TouchableOpacity
              onPress={() => setPickerOpen(true)}
              style={[inlineFieldBox, styles.picker]}
              accessibilityRole="button"
              accessibilityLabel={bank ? `Bank, ${bank.label}` : 'Select bank'}
              activeOpacity={0.8}>
              <Text style={[styles.pickerText, !bank && styles.placeholder]} numberOfLines={1}>
                {bank ? bank.label : 'Choose a bank'}
              </Text>
              <Icon name="chevronDown" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </InlineField>

          <InlineField
            label="Account no.:"
            labelWidth={LABEL_WIDTH}
            value={accountNumber}
            onChangeText={text => setAccountNumber(text.replace(/\D/g, '').slice(0, 10))}
            placeholder="10 digits"
            keyboardType="number-pad"
            maxLength={10}
            inputStyle={styles.accountInput}
            error={enquiry.status === 'error' ? enquiry.message : undefined}
          />
          {enquiry.status === 'loading' && (
            <View style={[styles.enquiry, {marginLeft: LABEL_WIDTH + 10}]}>
              <ActivityIndicator size="small" color={colors.textMuted} />
              <Text style={styles.enquiryPending}>Checking account…</Text>
            </View>
          )}
          {enquiry.status === 'ok' && (
            <View style={[styles.enquiry, {marginLeft: LABEL_WIDTH + 10}]} accessibilityLiveRegion="polite">
              <Icon name="check" size={14} color={colors.success} strokeWidth={2.6} />
              <Text style={styles.enquiryName}>{enquiry.name}</Text>
            </View>
          )}

          <InlineField
            label="Amount:"
            labelWidth={LABEL_WIDTH}
            value={amountText}
            onChangeText={text => setAmountText(formatAmountInput(text))}
            placeholder="₦0"
            keyboardType="decimal-pad"
            strong
            valid={amount > 0}
            error={over ? "That's more than your wallet balance." : undefined}
          />
        </View>

        <ChipGroup
          options={QUICK.map(v => ({id: v, label: `₦${v / 1000}k`}))}
          value={amount}
          onChange={v => setAmountText(formatAmountInput(String(v)))}
          equal
          filled
          size="md"
          accessibilityLabel="Quick amounts"
        />

        <InlineField
          label="Narration:"
          labelWidth={LABEL_WIDTH}
          value={narration}
          onChangeText={setNarration}
          placeholder="What's it for?"
          maxLength={100}
        />

        {showSaveBeneficiary && (
          <View style={styles.saveRow}>
            <View style={styles.saveText}>
              <Text style={styles.saveTitle}>Save beneficiary</Text>
              <Text style={styles.saveSub}>
                Send to {enquiry.status === 'ok' ? enquiry.name.split(' ')[0] : 'them'} faster next time
              </Text>
            </View>
            <Switch
              value={saveBeneficiary}
              onValueChange={setSaveBeneficiary}
              trackColor={{false: colors.surfaceRaised, true: colors.primary}}
              thumbColor={colors.white}
              ios_backgroundColor={colors.surfaceRaised}
              accessibilityLabel="Save beneficiary"
            />
          </View>
        )}
      </>
    );
  }

  return (
    <>
      <FormLayout
        title={title}
        onBack={() => navigation.goBack()}
        contentStyle={styles.content}
        footer={source.ready && <PrimaryButton title="Next" onPress={openSheet} disabled={!valid} />}>
        {body}
      </FormLayout>

      <PickerSheet
        visible={pickerOpen}
        title="Select bank"
        options={banks}
        value={bank?.id}
        searchPlaceholder="Search banks"
        onSelect={option => {
          setBank(option);
          setPickerOpen(false);
        }}
        onClose={() => setPickerOpen(false)}
      />

      {/* README gap 3: no fee quote endpoint, so no fee row */}
      {enquiry.status === 'ok' && (
        <ConfirmSheet
          visible={sheetOpen}
          title="Confirm transfer"
          rows={[
            {label: 'Name', value: enquiry.name},
            {label: 'Bank', value: `${bank.label} · ${accountNumber}`},
            {label: 'Amount', value: formatNaira(amount, {currency})},
            !!narration.trim() && {label: 'Narration', value: narration.trim()},
          ]}
          hero={
            requirePassword && (
              <PasswordInput
                label="Enter your password to confirm"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setPasswordError(null);
                }}
                error={passwordError}
                textContentType="password"
                autoComplete="current-password"
              />
            )
          }
          note="Bank transfers can't be reversed once sent."
          confirmLabel="Send now"
          confirmDisabled={requirePassword && !password}
          onConfirm={handleSend}
          onClose={() => setSheetOpen(false)}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    gap: 18,
  },
  balance: {
    ...type.sectionHeading,
    ...type.tabular,
    color: colors.text,
  },
  fields: {
    gap: 14,
  },
  picker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerText: {
    ...type.body,
    fontFamily: type.input.fontFamily,
    color: colors.text,
    flex: 1,
  },
  placeholder: {
    color: colors.textMuted,
  },
  accountInput: {
    letterSpacing: 0.5,
  },
  enquiry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -6,
  },
  enquiryPending: {
    ...type.label,
    color: colors.textMuted,
  },
  enquiryName: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.success,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  saveText: {
    flex: 1,
    gap: 2,
  },
  saveTitle: {
    ...type.bodyStrong,
    color: colors.text,
  },
  saveSub: {
    ...type.caption,
    color: colors.textMuted,
  },
});

export default TransferForm;
