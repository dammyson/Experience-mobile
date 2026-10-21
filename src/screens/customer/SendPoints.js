import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {
  ChoiceGrid,
  ChipGroup,
  ConfirmSheet,
  EmptyState,
  InlineField,
  KeyValueList,
  PrimaryButton,
  Skeleton,
  SkeletonList,
  StatusScreen,
} from '../../components/ui';
import {customerAPI} from '../../services/api';
import {getDashboard, invalidateDashboardCache} from '../../actions/customerActions';
import useRequest from '../../utilities/useRequest';
import {toList, getMerchantId, getMerchantName} from '../../utilities/customerData';
import {getSpendableSummary, valueOfPoints} from '../../utilities/spendable';
import {formatNumber, formatPts, formatEstimate, initials} from '../../utilities/format';
import {isNetworkError} from '../../utilities/errors';
import {colors, type, radii} from '../../theme/tokens';

const QUICK = [100, 500, 1000];

/**
 * Send points to a merchant. Params: {merchantId?}
 */
const SendPoints = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  const pointsReq = useRequest(() => customerAPI.getPointsByMerchant(), []);
  const merchants = useMemo(
    () =>
      toList(pointsReq.data, 'merchants')
        .filter(m => (Number(m.points) || 0) > 0)
        .map(m => ({id: getMerchantId(m), name: getMerchantName(m)})),
    [pointsReq.data],
  );

  const [merchantId, setMerchantId] = useState(route.params?.merchantId ?? null);
  const [pointsText, setPointsText] = useState('');
  const [note, setNote] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [result, setResult] = useState(null);

  const merchant = merchants.find(m => m.id === merchantId);

  const spendableReq = useRequest(
    () => (merchantId ? customerAPI.getSpendable(merchantId) : Promise.resolve({data: null})),
    [merchantId],
  );
  const summary = useMemo(() => getSpendableSummary(spendableReq.data), [spendableReq.data]);
  const max = summary.points;

  const points = Number(pointsText.replace(/\D/g, '')) || 0;
  const over = points > max;
  const valid = !!merchant && points > 0 && !over && !spendableReq.loading;
  const value = valueOfPoints(summary, points);

  const quickOptions = [
    ...QUICK.filter(v => v < max).map(v => ({id: v, label: formatNumber(v)})),
    {id: max, label: 'Max'},
  ];

  const handleSend = async () => {
    try {
      const response = await customerAPI.sendPoints(merchant.id, {points, note: note.trim()});
      setSheetOpen(false);
      setResult({status: 'success', data: response.data});
      await dispatch(invalidateDashboardCache());
      dispatch(getDashboard(true)).catch(() => {});
    } catch (err) {
      setSheetOpen(false);
      setResult(
        isNetworkError(err)
          ? {
              status: 'pending',
              message: 'We lost connection before the merchant confirmed. Check your activity before sending again.',
            }
          : {status: 'failed', message: err.message || "The points couldn't be sent."},
      );
    }
  };

  if (result) {
    const success = result.status === 'success';
    return (
      <StatusScreen
        headerTitle="Send points"
        status={result.status}
        title={
          success ? 'Points sent' : result.status === 'pending' ? "We couldn't confirm this" : 'Points not sent'
        }
        body={
          success
            ? `You sent ${formatPts(points)} to ${merchant.name}.`
            : result.status === 'failed'
              ? `${result.message} No points left your balance.`
              : result.message
        }
        details={[
          {label: 'Merchant', value: merchant.name},
          {label: 'Points', value: formatPts(points), color: colors.points},
          !!note.trim() && {label: 'Note', value: note.trim()},
          success && result.data?.reference && {label: 'Reference', value: result.data.reference},
        ]}
        secondary={success ? undefined : {title: 'Cancel', onPress: () => navigation.goBack()}}
        primary={
          success
            ? {title: 'Done', onPress: () => navigation.goBack()}
            : {
                title: 'Try again',
                onPress: () => {
                  setResult(null);
                  spendableReq.reload();
                },
              }
        }
      />
    );
  }

  let body;
  if (pointsReq.loading) {
    body = <SkeletonList rows={3} />;
  } else if (pointsReq.error) {
    body = <RequestState error={pointsReq.error} onRetry={pointsReq.reload} />;
  } else if (merchants.length === 0) {
    body = <EmptyState title="No points to send yet" hint="Earn points at a partner merchant first." />;
  } else if (!merchant) {
    body = (
      <ChoiceGrid
        prompt="Choose merchant"
        columns={3}
        tileHeight={76}
        options={merchants.map(m => ({id: m.id, label: m.name, initials: initials(m.name)}))}
        value={merchantId}
        onChange={setMerchantId}
      />
    );
  } else {
    body = (
      <>
        <View style={styles.merchantRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{initials(merchant.name)}</Text>
          </View>
          <View style={styles.merchantText}>
            <Text style={styles.merchantName}>{merchant.name}</Text>
            {spendableReq.loading ? (
              <Skeleton width={120} height={11} />
            ) : (
              <Text style={styles.merchantSub}>{formatNumber(max)} pts eligible here</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => {
              setMerchantId(null);
              setPointsText('');
            }}
            accessibilityRole="button"
            accessibilityLabel="Change merchant"
            hitSlop={{top: 14, bottom: 14, left: 14, right: 14}}>
            <Text style={styles.change}>Change</Text>
          </TouchableOpacity>
        </View>

        {spendableReq.error ? (
          <RequestState error={spendableReq.error} onRetry={spendableReq.reload} />
        ) : (
          <>
            <View style={styles.fields}>
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
                error={over ? `You have ${formatPts(max)} eligible at ${merchant.name}.` : undefined}
              />
              <InlineField
                label="Note:"
                labelWidth={76}
                value={note}
                onChangeText={setNote}
                placeholder="Optional"
                maxLength={140}
              />
            </View>

            {max > 0 && (
              <ChipGroup
                options={quickOptions}
                value={points}
                onChange={v => setPointsText(formatNumber(v))}
                equal
                filled
                size="md"
                accessibilityLabel="Quick amounts"
              />
            )}

            <View style={styles.summary}>
              <KeyValueList
                rows={[
                  {label: 'You send', value: formatPts(points), color: colors.points},
                  value != null && {
                    label: 'Value to merchant',
                    value: formatEstimate(value, {currency: summary.currency}),
                    color: colors.success,
                  },
                  {label: `Left at ${merchant.name}`, value: over ? '—' : formatPts(max - points)},
                ]}
              />
            </View>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <FormLayout
        title="Send points"
        onBack={() => navigation.goBack()}
        contentStyle={styles.content}
        footer={merchant && <PrimaryButton title="Review" onPress={() => setSheetOpen(true)} disabled={!valid} />}>
        {body}
      </FormLayout>

      {!!merchant && (
        <ConfirmSheet
          visible={sheetOpen}
          title={`Send to ${merchant.name}`}
          hero={<Text style={styles.sheetAmount}>{formatPts(points)}</Text>}
          note="Points sent to a merchant can't be taken back."
          confirmLabel="Send points"
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
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  badge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...type.captionStrong,
    fontFamily: type.balance.fontFamily,
    fontSize: 12,
    color: colors.text,
  },
  merchantText: {
    flex: 1,
    gap: 2,
  },
  merchantName: {
    ...type.bodyStrong,
    color: colors.text,
  },
  merchantSub: {
    ...type.caption,
    color: colors.textMuted,
  },
  change: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
  fields: {
    gap: 14,
  },
  summary: {
    padding: 14,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  sheetAmount: {
    ...type.balance,
    color: colors.points,
    textAlign: 'center',
  },
});

export default SendPoints;
