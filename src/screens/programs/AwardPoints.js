import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {
  Button,
  ButtonPair,
  ChipGroup,
  ChoiceGrid,
  EmptyState,
  InlineField,
  KeyValueCard,
  PrimaryButton,
  SkeletonList,
  StatusScreen,
} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import CustomerFinder from '../../components/merchant/CustomerFinder';
import {getMerchantPrograms} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {
  useMerchantId,
  readPrograms,
  readBalance,
  isPrepaid,
  isOpen,
  customerName,
  maskPhone,
} from '../../utilities/merchantData';
import {formatNaira, formatNumber, formatPts} from '../../utilities/format';
import {isNetworkError} from '../../utilities/errors';
import {colors, type, radii} from '../../theme/tokens';

const TOTAL_STEPS = 5;
const QUICK = [100, 250, 500, 1000];

/**
 * Award points: 1 customer → 2 program → 3 points & reason → 4 review → 5 result.
 * Params (all optional): {program, customer, foundBy, identifier: {key, value, label, short}}
 * — steps already answered by the params are skipped.
 */
const AwardPoints = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const params = useRoute().params ?? {};
  const merchantId = useMerchantId();
  const {programs, programsLoading, error: programsError} = useSelector(state => state.merchant);

  const [customer, setCustomer] = useState(params.customer ?? null);
  const [foundBy, setFoundBy] = useState(params.foundBy ?? null);
  const [identifier, setIdentifier] = useState(params.identifier ?? null);
  const [program, setProgram] = useState(params.program ?? null);
  const [pointsText, setPointsText] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState(null);

  // The step this visit starts on, from the params; back never goes below it
  const [firstStep, setFirstStep] = useState(() =>
    params.customer || params.identifier ? (params.program ? 3 : 2) : 1,
  );
  const [step, setStep] = useState(firstStep);

  useEffect(() => {
    if (merchantId && !programs) {
      dispatch(getMerchantPrograms(merchantId)).catch(() => {});
    }
  }, [dispatch, merchantId, programs]);

  const openPrograms = useMemo(() => readPrograms(programs).filter(isOpen), [programs]);

  const balanceReq = useRequest(
    () => (program ? merchantAPI.getProgramBalance(merchantId, program.id) : Promise.resolve({data: null})),
    [merchantId, program?.id],
  );
  const funding = readBalance(balanceReq.data);

  const points = Number(pointsText.replace(/\D/g, '')) || 0;
  const pointValue = Number(program?.point_value ?? balanceReq.data?.point_value) || null;
  const cost = pointValue != null ? points * pointValue : null;
  const prepaid = isPrepaid(program);
  const overFunding = prepaid && cost != null && funding.left != null && cost > funding.left;

  const recipient = customer ? customerName(customer) : identifier?.value;

  // Back goes to the previous step until the first one this visit started on
  const goBack = () => (step > firstStep && step < 5 ? setStep(step - 1) : navigation.goBack());
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (step > firstStep && step < 5) {
          e.preventDefault();
          setStep(s => s - 1);
        }
      }),
    [navigation, step, firstStep],
  );

  const handleConfirm = async () => {
    try {
      const response = customer
        ? await merchantAPI.awardPoints(merchantId, program.id, customer.id, {points, reason: reason.trim()})
        : await merchantAPI.awardByIdentifier(merchantId, program.id, {
            identifier: {[identifier.key]: identifier.value},
            points,
            reason: reason.trim(),
          });
      setResult({status: 'success', data: response.data});
      setStep(5);
    } catch (err) {
      setResult(
        isNetworkError(err)
          ? {
              status: 'pending',
              message: "We lost connection before the award was confirmed. Check Activity before awarding again.",
            }
          : {status: 'failed', message: err.message || "The points couldn't be awarded."},
      );
      setStep(5);
    }
  };

  const startOver = () => {
    setCustomer(null);
    setIdentifier(null);
    setFoundBy(null);
    setPointsText('');
    setReason('');
    setResult(null);
    setFirstStep(1);
    setStep(1);
  };

  // ── Step 5: result ───────────────────────────────────────────────────────
  if (step === 5 && result) {
    const success = result.status === 'success';
    const ledgerId = result.data?.ledger_entry_id ?? result.data?.ledger_entry?.id;
    return (
      <StatusScreen
        headerTitle="Award points"
        status={result.status}
        title={success ? 'Points awarded' : result.status === 'pending' ? "We couldn't confirm the award" : 'Points not awarded'}
        body={success ? `${formatPts(points)} added to ${recipient}'s ${program.name} balance.` : result.message}
        details={[
          {label: 'Customer', value: recipient},
          {label: 'Program', value: program.name},
          {label: 'Points', value: formatPts(points), color: colors.points},
          success && !!ledgerId && {label: 'Ledger entry', value: String(ledgerId)},
        ]}
        secondary={{title: success ? 'Done' : 'Cancel', onPress: () => navigation.goBack()}}
        primary={
          success
            ? {title: 'Award another', onPress: startOver}
            : {
                title: 'Try again',
                onPress: () => {
                  setResult(null);
                  setStep(4);
                },
              }
        }
      />
    );
  }

  // ── Step 4: review ───────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <FormLayout
        title="Review award"
        onBack={goBack}
        step={{current: 4, total: TOTAL_STEPS}}
        contentStyle={styles.content}
        footer={
          <ButtonPair
            secondary={{title: 'Cancel', onPress: () => navigation.goBack()}}
            primary={{title: 'Confirm award', onPress: handleConfirm}}
          />
        }>
        <View style={styles.hero} accessible accessibilityLabel={`Awarding ${formatPts(points)} to ${recipient}`}>
          <Text style={styles.heroLabel}>Awarding</Text>
          <Text style={styles.heroValue}>{formatPts(points)}</Text>
          <Text style={styles.heroSub}>to {recipient}</Text>
        </View>

        <KeyValueCard
          title="Award details"
          rows={[
            {
              label: 'Customer',
              value: customer
                ? [recipient, customer.phone_number && maskPhone(customer.phone_number)].filter(Boolean).join(' · ')
                : `New · ${identifier.value}`,
            },
            {label: 'Found by', value: foundBy || identifier?.label || '—'},
            {label: 'Program', value: `${program.name} · ${prepaid ? 'Prepaid' : 'Postpaid'}`},
            !!reason.trim() && {label: 'Reason', value: reason.trim()},
          ]}
        />

        {cost != null && (
          <KeyValueCard
            title="Funding impact"
            rows={
              prepaid
                ? [
                    {label: 'Committed from program funds', value: formatNaira(cost)},
                    funding.left != null && {divider: true},
                    funding.left != null && {label: 'Funding left after', value: formatNaira(funding.left - cost), total: true},
                  ]
                : [{label: 'Billed when the program closes', value: formatNaira(cost)}]
            }
          />
        )}

        {!customer && (
          <View style={styles.warn} accessibilityRole="alert">
            <Icon name="alert" size={18} color={colors.pending} />
            <Text style={styles.warnText}>
              No customer matches this {identifier.short}. Confirming creates a new customer record with it and adds
              the points there.
            </Text>
          </View>
        )}

        <Text style={styles.note}>You can reverse this award later, in full or in part.</Text>
      </FormLayout>
    );
  }

  // ── Step 3: points & reason ──────────────────────────────────────────────
  if (step === 3) {
    return (
      <FormLayout
        title="Award points"
        onBack={goBack}
        step={{current: 3, total: TOTAL_STEPS}}
        contentStyle={styles.content}
        footer={<PrimaryButton title="Review" onPress={() => setStep(4)} disabled={points <= 0 || overFunding} />}>
        <Text style={styles.heading} accessibilityRole="header">
          How many points for {recipient}?
        </Text>
        <InlineField
          label="Points:"
          labelWidth={76}
          value={pointsText}
          onChangeText={text => {
            const digits = text.replace(/\D/g, '');
            setPointsText(digits ? formatNumber(digits) : '');
          }}
          placeholder="0"
          keyboardType="number-pad"
          strong
          valid={points > 0}
          error={overFunding ? `Not enough program funding (${formatNaira(funding.left)} left).` : undefined}
        />
        <ChipGroup
          options={QUICK.map(v => ({id: v, label: formatNumber(v)}))}
          value={points}
          onChange={v => setPointsText(formatNumber(v))}
          equal
          filled
          size="md"
          accessibilityLabel="Quick amounts"
        />
        <InlineField
          label="Reason:"
          labelWidth={76}
          value={reason}
          onChangeText={setReason}
          placeholder="e.g. Purchase ₦5,000"
          maxLength={120}
        />
        {cost != null && points > 0 && (
          <Text style={styles.note}>
            {prepaid
              ? `${formatNaira(cost)} of program funding${funding.left != null ? ` · ${formatNaira(funding.left)} left` : ''}`
              : `${formatNaira(cost)} billed when the program closes`}
          </Text>
        )}
      </FormLayout>
    );
  }

  // ── Step 2: program ──────────────────────────────────────────────────────
  if (step === 2) {
    return (
      <FormLayout
        title="Award points"
        onBack={goBack}
        step={{current: 2, total: TOTAL_STEPS}}
        contentStyle={styles.content}
        footer={openPrograms.length > 0 && <PrimaryButton title="Continue" onPress={() => setStep(3)} disabled={!program} />}>
        {programsLoading && !programs ? (
          <SkeletonList rows={2} />
        ) : !programs && programsError ? (
          <RequestState
            error={programsError}
            onRetry={() => dispatch(getMerchantPrograms(merchantId, true)).catch(() => {})}
          />
        ) : openPrograms.length === 0 ? (
          <EmptyState
            title="No open programs"
            hint="Create a program before awarding points."
            action={{label: 'New program', onPress: () => navigation.replace('CreateProgram')}}
          />
        ) : (
          <ChoiceGrid
            prompt="Choose program"
            options={openPrograms.map(p => ({
              id: p.id,
              label: p.name,
              hint: isPrepaid(p) ? 'Prepaid' : 'Postpaid',
              icon: <Icon name={isPrepaid(p) ? 'wallet' : 'receipt'} size={20} color={colors.text} />,
            }))}
            value={program?.id}
            onChange={id => setProgram(openPrograms.find(p => p.id === id))}
          />
        )}
      </FormLayout>
    );
  }

  // ── Step 1: customer ─────────────────────────────────────────────────────
  return (
    <FormLayout title="Award points" onBack={goBack} step={{current: 1, total: TOTAL_STEPS}} contentStyle={styles.content}>
      {!merchantId ? (
        <RequestState error="No business is linked to this account." />
      ) : (
        <CustomerFinder
          merchantId={merchantId}
          renderFound={(found, ident) => (
            <View style={styles.flex}>
              <Button
                title="Continue"
                size="sm"
                onPress={() => {
                  setCustomer(found);
                  setFoundBy(ident.label);
                  setIdentifier(null);
                  setStep(program ? 3 : 2);
                }}
              />
            </View>
          )}
          renderMissing={(ident, value) => (
            <View style={styles.missingAction}>
              <Button
                title="Award as new customer"
                size="sm"
                onPress={() => {
                  setCustomer(null);
                  setIdentifier({key: ident.awardKey, value, label: ident.label, short: ident.short});
                  setStep(program ? 3 : 2);
                }}
              />
            </View>
          )}
        />
      )}
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    gap: 18,
  },
  flex: {
    flex: 1,
  },
  missingAction: {
    alignSelf: 'flex-start',
    minWidth: 190,
  },
  heading: {
    ...type.sectionHeading,
    color: colors.text,
  },
  hero: {
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
  },
  heroLabel: {
    ...type.label,
    color: colors.textSecondary,
  },
  heroValue: {
    ...type.balance,
    color: colors.points,
  },
  heroSub: {
    ...type.label,
    color: '#D9D9E3',
  },
  warn: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: colors.pendingBg,
    borderWidth: 1,
    borderColor: '#4A3A1C',
  },
  warnText: {
    ...type.label,
    flex: 1,
    lineHeight: 18,
    color: '#F5D08A',
  },
  note: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default AwardPoints;
