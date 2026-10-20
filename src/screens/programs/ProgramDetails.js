import React, {useCallback, useRef, useState} from 'react';
import {Text, StyleSheet, RefreshControl} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import {showMessage} from 'react-native-flash-message';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {ButtonPair, ConfirmSheet, KeyValueCard, PrimaryButton, SkeletonList} from '../../components/ui';
import {getMerchantPrograms, getMerchantWallet} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {useMerchantId, readBalance, programRule, programTag, isPrepaid, isOpen} from '../../utilities/merchantData';
import {formatType} from '../../utilities/merchantActivity';
import {formatNaira, formatPts, formatActivityDate} from '../../utilities/format';
import {colors, type} from '../../theme/tokens';

const ProgramDetails = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {program} = useRoute().params;
  const merchantId = useMerchantId();
  const [closing, setClosing] = useState(false);

  const balanceReq = useRequest(() => merchantAPI.getProgramBalance(merchantId, program.id), [merchantId, program.id]);
  const policyReq = useRequest(
    () => merchantAPI.getProgramRedemptionPolicy(merchantId, program.id),
    [merchantId, program.id],
  );

  // Reload on return so figures reflect points just awarded
  const hasFocused = useRef(false);
  const {reload: reloadBalance} = balanceReq;
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        reloadBalance();
      }
      hasFocused.current = true;
    }, [reloadBalance]),
  );

  const balance = balanceReq.data;
  const b = readBalance(balance);
  const currency = balance?.currency || program.currency;
  const money = value => (value != null ? formatNaira(value, {currency}) : '—');
  const tag = programTag(program, balance);
  const open = isOpen(program);
  const policy = policyReq.data?.policy ?? policyReq.data;
  const cap = policy?.maximum_redemption_percentage ?? program.maximum_redemption_percentage;

  const handleClose = async () => {
    try {
      await merchantAPI.closeProgram(merchantId, program.id);
      setClosing(false);
      showMessage({message: `${program.name} closed`, type: 'success'});
      dispatch(getMerchantPrograms(merchantId, true)).catch(() => {});
      dispatch(getMerchantWallet(merchantId, true)).catch(() => {});
      navigation.goBack();
    } catch (err) {
      setClosing(false);
      showMessage({message: err.message || "The program couldn't be closed.", type: 'danger'});
    }
  };

  const award = () => navigation.navigate('AwardPoints', {program});

  return (
    <>
      <FormLayout
        title={program.name || 'Program'}
        onBack={() => navigation.goBack()}
        contentStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={balanceReq.refreshing}
            onRefresh={() => {
              balanceReq.refresh();
              policyReq.refresh();
            }}
            tintColor={colors.link}
          />
        }
        footer={
          open &&
          (isPrepaid(program) ? (
            <PrimaryButton title="Award points" onPress={award} />
          ) : (
            <ButtonPair
              secondary={{title: 'Close program', onPress: () => setClosing(true)}}
              primary={{title: 'Award points', onPress: award}}
            />
          ))
        }>
        <Text style={[styles.tag, {color: tag.fg}]}>{tag.label}</Text>
        {!!programRule(program) && <Text style={styles.rule}>{programRule(program)}</Text>}

        {balanceReq.loading ? (
          <SkeletonList rows={2} />
        ) : balanceReq.error ? (
          <RequestState error={balanceReq.error} onRetry={balanceReq.reload} />
        ) : (
          <KeyValueCard
            title="Funding"
            rows={
              isPrepaid(program)
                ? [
                    {label: 'Funded', value: money(b.funded)},
                    {label: 'Used', value: money(b.used)},
                    {label: 'Funding left', value: money(b.left), color: colors.success},
                    b.pointsAwarded != null && {label: 'Points awarded', value: formatPts(b.pointsAwarded), color: colors.points},
                  ]
                : [
                    b.pointsAwarded != null && {label: 'Points awarded', value: formatPts(b.pointsAwarded), color: colors.points},
                    {
                      label: open ? 'Owed if closed' : 'Amount due',
                      value: money(b.due),
                      color: tag.pending ? colors.pending : undefined,
                    },
                    !!b.settlement && {label: 'Settlement', value: formatType(b.settlement)},
                    balance?.updated_at && {label: 'Last updated', value: formatActivityDate(balance.updated_at)},
                  ]
            }
          />
        )}

        {!policyReq.loading && !policyReq.error && (
          <KeyValueCard
            title="Redemption"
            rows={[
              cap != null && {label: 'Max share of a purchase', value: `${Number(cap)}%`},
              {label: 'Where points can be spent', value: formatType(policy?.redemption_mode || program.redemption_mode) || 'Private'},
              {label: 'Expiry', value: formatType(program.expiration_type) || 'Never'},
            ]}
          />
        )}
      </FormLayout>

      <ConfirmSheet
        visible={closing}
        title={`Close ${program.name}?`}
        rows={[b.due != null && {label: 'Charged to your wallet', value: money(b.due)}]}
        note="Customers can't earn in this program once it's closed. Your wallet is charged for the points awarded."
        editLabel="Cancel"
        confirmLabel="Close program"
        destructive
        onConfirm={handleClose}
        onClose={() => setClosing(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  tag: {
    ...type.captionStrong,
    textTransform: 'uppercase',
    letterSpacing: 0.66,
  },
  rule: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
    marginTop: -10,
  },
});

export default ProgramDetails;
