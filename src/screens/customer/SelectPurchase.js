import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, RefreshControl, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation, useRoute} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {ChoiceGrid, EmptyState, PrimaryButton, Skeleton, SkeletonList} from '../../components/ui';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {toList, getMerchantId, getMerchantName} from '../../utilities/customerData';
import {getSpendableSummary, pointsForAmount} from '../../utilities/spendable';
import {formatNaira, formatNumber, formatEstimate, formatActivityDate, initials} from '../../utilities/format';
import {shortId} from '../../utilities/customerTransaction';
import {colors, type, radii} from '../../theme/tokens';

const PurchaseOption = ({purchase, selected, onPress}) => {
  const {eligible, need} = purchase;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!eligible}
      activeOpacity={0.8}
      accessibilityRole="radio"
      accessibilityState={{checked: selected, disabled: !eligible}}
      accessibilityLabel={[
        purchase.ref,
        purchase.amountLabel,
        need != null ? (eligible ? `${formatNumber(need)} points` : `needs ${formatNumber(need)} points`) : null,
      ]
        .filter(Boolean)
        .join(', ')}
      style={[styles.option, selected && styles.optionSelected, !eligible && styles.optionDisabled]}>
      <View style={[styles.radio, selected && styles.radioSelected]}>{selected && <View style={styles.radioDot} />}</View>
      <View style={styles.optionText}>
        <Text style={styles.optionRef}>{purchase.ref}</Text>
        {!!purchase.sub && <Text style={styles.optionSub}>{purchase.sub}</Text>}
      </View>
      <View style={styles.optionAmounts}>
        <Text style={styles.optionAmount}>{purchase.amountLabel}</Text>
        {need != null && (
          <Text style={[styles.optionPts, !eligible && styles.optionPtsShort]}>
            {eligible ? `${formatNumber(need)} pts` : `Needs ${formatNumber(need)} pts`}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const SelectPurchase = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const pointsReq = useRequest(() => customerAPI.getPointsByMerchant(), []);

  const merchants = useMemo(
    () =>
      toList(pointsReq.data, 'merchants')
        .filter(m => (Number(m.points) || 0) > 0)
        .map(m => ({id: getMerchantId(m), name: getMerchantName(m)})),
    [pointsReq.data],
  );

  const [merchantId, setMerchantId] = useState(route.params?.merchantId);
  const [purchaseId, setPurchaseId] = useState(null);

  useEffect(() => {
    if (!merchantId && merchants.length) {
      setMerchantId(merchants[0].id);
    }
  }, [merchantId, merchants]);

  const merchant = merchants.find(m => m.id === merchantId);

  const spendableReq = useRequest(
    () => (merchantId ? customerAPI.getSpendable(merchantId) : Promise.resolve({data: null})),
    [merchantId],
  );
  const purchasesReq = useRequest(
    () =>
      merchantId ? customerAPI.getPurchases({status: 'OPEN', merchantId}) : Promise.resolve({data: null}),
    [merchantId],
  );

  // Reload when coming back from a payment; the first load happens on mount
  const hasFocused = useRef(false);
  const {reload: reloadPurchases} = purchasesReq;
  const {reload: reloadSpendable} = spendableReq;
  useFocusEffect(
    useCallback(() => {
      if (hasFocused.current) {
        reloadPurchases();
        reloadSpendable();
      }
      hasFocused.current = true;
    }, [reloadPurchases, reloadSpendable]),
  );

  const summary = useMemo(() => getSpendableSummary(spendableReq.data), [spendableReq.data]);

  const purchases = useMemo(
    () =>
      toList(purchasesReq.data, 'purchases').map(p => {
        const need = pointsForAmount(summary, p.amount);
        return {
          raw: p,
          id: p.id,
          ref: p.reference ? `#${p.reference}` : `#${shortId(p.id)}`,
          sub: [formatActivityDate(p.created_at), p.note].filter(Boolean).join(' · '),
          amountLabel: formatNaira(p.amount, {currency: p.currency || summary.currency}),
          need,
          // Without a point value, let the server decide
          eligible: need == null || need <= summary.points,
        };
      }),
    [purchasesReq.data, summary],
  );

  // Keep the selection valid when the list changes
  useEffect(() => {
    const current = purchases.find(p => p.id === purchaseId && p.eligible);
    if (!current) {
      setPurchaseId(purchases.find(p => p.eligible)?.id ?? null);
    }
  }, [purchases, purchaseId]);

  const selected = purchases.find(p => p.id === purchaseId);

  const refresh = () => {
    pointsReq.refresh();
    spendableReq.refresh();
    purchasesReq.refresh();
  };

  const handleContinue = () =>
    navigation.navigate('PayWithPoints', {
      merchant,
      purchase: selected.raw,
      pointsNeeded: selected.need,
      spendable: summary,
    });

  let body;
  if (pointsReq.loading) {
    body = <SkeletonList rows={3} />;
  } else if (pointsReq.error) {
    body = <RequestState error={pointsReq.error} onRetry={pointsReq.reload} />;
  } else if (merchants.length === 0) {
    body = (
      <EmptyState
        title="No points to spend yet"
        hint="Earn points at a partner merchant, then pay for purchases there with them."
      />
    );
  } else {
    body = (
      <>
        <ChoiceGrid
          prompt="Choose merchant"
          columns={3}
          tileHeight={76}
          options={merchants.map(m => ({id: m.id, label: m.name, initials: initials(m.name)}))}
          value={merchantId}
          onChange={setMerchantId}
        />

        {spendableReq.loading ? (
          <Skeleton height={64} radius={radii.cta} />
        ) : (
          !!merchant && (
            <View style={styles.spendable}>
              <View style={styles.spendableBlock}>
                <Text style={styles.spendableLabel}>Eligible at {merchant.name}</Text>
                <Text style={styles.spendablePts}>{formatNumber(summary.points)} pts</Text>
              </View>
              {summary.value != null && (
                <View style={[styles.spendableBlock, styles.alignEnd]}>
                  <Text style={styles.spendableLabel}>Spendable</Text>
                  <Text style={styles.spendableValue}>{formatEstimate(summary.value, {currency: summary.currency})}</Text>
                </View>
              )}
            </View>
          )
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Open purchases
          </Text>
          {purchasesReq.loading ? (
            <SkeletonList rows={2} />
          ) : purchasesReq.error ? (
            <RequestState error={purchasesReq.error} onRetry={purchasesReq.reload} />
          ) : purchases.length === 0 ? (
            <EmptyState
              title="No open purchases here"
              hint="Ask the cashier to create your purchase, then pull to refresh."
            />
          ) : (
            <View style={styles.options} accessibilityRole="radiogroup">
              {purchases.map(p => (
                <PurchaseOption
                  key={p.id}
                  purchase={p}
                  selected={p.id === purchaseId}
                  onPress={() => setPurchaseId(p.id)}
                />
              ))}
            </View>
          )}
        </View>
      </>
    );
  }

  return (
    <FormLayout
      title="Pay with points"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={purchasesReq.refreshing} onRefresh={refresh} tintColor={colors.link} />
      }
      footer={
        merchants.length > 0 && (
          <>
            <Text style={styles.helper}>The full purchase amount is paid with points.</Text>
            <PrimaryButton title="Continue" onPress={handleContinue} disabled={!selected} />
          </>
        )
      }>
      {body}
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
  },
  spendable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  spendableBlock: {
    gap: 2,
  },
  alignEnd: {
    alignItems: 'flex-end',
  },
  spendableLabel: {
    ...type.caption,
    color: colors.textMuted,
  },
  spendablePts: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    fontSize: 16,
    lineHeight: 22,
    color: colors.points,
  },
  spendableValue: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    fontSize: 14,
    color: colors.success,
  },
  section: {
    gap: 8,
  },
  sectionTitle: {
    ...type.sectionHeadingSm,
    color: colors.text,
  },
  options: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.cta,
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: colors.surface,
  },
  optionSelected: {
    borderColor: colors.primaryBorder,
    backgroundColor: 'rgba(107,78,240,0.16)',
  },
  optionDisabled: {
    opacity: 0.55,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#4A4A58',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primaryBorder,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primaryBorder,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
  optionRef: {
    ...type.bodyStrong,
    color: colors.text,
  },
  optionSub: {
    ...type.caption,
    color: colors.textMuted,
  },
  optionAmounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  optionAmount: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    color: colors.text,
  },
  optionPts: {
    ...type.caption,
    ...type.tabular,
    color: colors.points,
  },
  optionPtsShort: {
    color: colors.danger,
  },
  helper: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default SelectPurchase;
