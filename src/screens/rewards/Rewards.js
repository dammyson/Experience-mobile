import React, {useMemo, useState} from 'react';
import {View, Text, TextInput, ScrollView, RefreshControl, StatusBar, StyleSheet} from 'react-native';
import dayjs from 'dayjs';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {Button, EmptyState, Skeleton} from '../../components/ui';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {toList, getMerchantId, getMerchantName, redemptionNote} from '../../utilities/customerData';
import {formatNumber, formatEstimate} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const SEGMENT_COLORS = [colors.primaryBorder, colors.success, colors.pending];
const OTHER_COLOR = colors.sheetHandle;
const SHOWN_MERCHANTS = 3;

// "Expires 31 Dec · Pay up to 50%" from the merchant's first program, else a program count
const merchantNote = merchant => {
  const programs = merchant.programs || [];
  const program = programs[0];
  const expires = program?.expires_at || program?.expiry_date;
  const parts = [
    expires && dayjs(expires).isValid() ? `Expires ${dayjs(expires).format('D MMM')}` : null,
    redemptionNote(program),
  ].filter(Boolean);
  if (parts.length) {
    return parts.join(' · ');
  }
  return programs.length ? `${programs.length} program${programs.length === 1 ? '' : 's'}` : '';
};

const Rewards = () => {
  const points = useRequest(() => customerAPI.getPointsByMerchant(), []);
  const [code, setCode] = useState('');
  const [claim, setClaim] = useState({status: 'idle', message: ''});

  const currency = points.data?.currency || 'NGN';

  const rows = useMemo(() => {
    const merchants = toList(points.data, 'merchants')
      .map(m => ({
        id: getMerchantId(m),
        name: getMerchantName(m),
        points: Number(m.points) || 0,
        value: m.estimated_value != null ? Number(m.estimated_value) : null,
        note: merchantNote(m),
      }))
      .sort((a, b) => b.points - a.points);

    const top = merchants.slice(0, SHOWN_MERCHANTS).map((m, i) => ({...m, color: SEGMENT_COLORS[i]}));
    const rest = merchants.slice(SHOWN_MERCHANTS);
    if (rest.length) {
      top.push({
        id: 'others',
        name: `${rest.length} more merchant${rest.length === 1 ? '' : 's'}`,
        note: rest.map(m => m.name).join(', '),
        points: rest.reduce((sum, m) => sum + m.points, 0),
        value: rest.some(m => m.value != null) ? rest.reduce((sum, m) => sum + (m.value || 0), 0) : null,
        color: OTHER_COLOR,
      });
    }
    return top;
  }, [points.data]);

  const totalPoints = points.data?.total_points ?? rows.reduce((sum, r) => sum + r.points, 0);
  const totalValue = points.data?.total_estimated_value;

  const handleClaim = async () => {
    setClaim({status: 'idle', message: ''});
    try {
      await customerAPI.claimGiveaway(code.trim().toUpperCase());
      setClaim({status: 'submitted', message: 'Claim submitted — points show once the server confirms.'});
      setCode('');
      points.refresh();
    } catch (err) {
      setClaim({status: 'error', message: err.message || "We couldn't claim that code."});
    }
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Rewards" root />
      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: TAB_SCROLL_INSET}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={points.refreshing} onRefresh={points.refresh} tintColor={colors.link} />
        }>
        {points.loading ? (
          <Skeleton height={104} radius={18} />
        ) : points.error ? (
          <RequestState error={points.error} onRetry={points.reload} />
        ) : (
          <>
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryBlock} accessible accessibilityLabel={`Total points ${formatNumber(totalPoints)}`}>
                  <Text style={styles.summaryLabel}>Total points</Text>
                  <Text style={styles.summaryValue}>
                    {formatNumber(totalPoints)} <Text style={styles.summarySuffix}>pts</Text>
                  </Text>
                </View>
                {totalValue != null && (
                  <View style={[styles.summaryBlock, styles.summaryRight]}>
                    <Text style={styles.summaryLabel}>Spendable value</Text>
                    <Text style={styles.estimate}>{formatEstimate(totalValue, {currency})}</Text>
                  </View>
                )}
              </View>
              {totalPoints > 0 && (
                <View style={styles.bar} importantForAccessibility="no-hide-descendants">
                  {rows
                    .filter(r => r.points > 0)
                    .map(r => (
                      <View key={r.id} style={{flex: r.points, backgroundColor: r.color}} />
                    ))}
                </View>
              )}
            </View>

            <View>
              <Text style={styles.sectionTitle} accessibilityRole="header">
                By merchant
              </Text>
              {rows.length === 0 ? (
                <EmptyState
                  title="No points yet"
                  hint="Earn points at partner merchants and they'll show up here."
                  style={styles.emptyTop}
                />
              ) : (
                rows.map(r => (
                  <View
                    key={r.id}
                    style={styles.merchantRow}
                    accessible
                    accessibilityLabel={`${r.name}, ${formatNumber(r.points)} points`}>
                    <View style={[styles.dot, {backgroundColor: r.color}]} />
                    <View style={styles.merchantText}>
                      <Text style={styles.merchantName} numberOfLines={1}>
                        {r.name}
                      </Text>
                      {!!r.note && (
                        <Text style={styles.merchantNote} numberOfLines={1}>
                          {r.note}
                        </Text>
                      )}
                    </View>
                    <View style={styles.merchantAmounts}>
                      <Text style={styles.merchantPts}>{formatNumber(r.points)} pts</Text>
                      {r.value != null && (
                        <Text style={styles.merchantNote}>{formatEstimate(r.value, {currency})}</Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}

        <View style={styles.giveaway}>
          <View style={styles.giveawayText}>
            <Text style={styles.sectionTitleFlat} accessibilityRole="header">
              Have a giveaway code?
            </Text>
            <Text style={styles.giveawayHint}>Enter it to claim points from a merchant campaign.</Text>
          </View>
          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>Code:</Text>
            <TextInput
              value={code}
              onChangeText={value => {
                setCode(value.toUpperCase());
                setClaim({status: 'idle', message: ''});
              }}
              placeholder="KOPI-7Q2X"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              accessibilityLabel="Giveaway code"
              style={styles.codeInput}
            />
          </View>
          <Button title="Claim points" size="md" onPress={handleClaim} disabled={!code.trim()} />
          {claim.status !== 'idle' && (
            <Text
              style={[styles.claimMessage, claim.status === 'error' && styles.claimError]}
              accessibilityRole="alert">
              {claim.message}
            </Text>
          )}
        </View>

        {/* README gap 1: no customer-facing reward catalog endpoint yet */}
        <EmptyState title="Reward catalog coming soon" hint="Until then, spend points with Pay with points." />
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
  summary: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: 16,
    gap: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryBlock: {
    gap: 2,
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryLabel: {
    ...type.caption,
    color: colors.textMuted,
  },
  summaryValue: {
    ...type.balance,
    fontSize: 26,
    lineHeight: 32,
    color: colors.text,
  },
  summarySuffix: {
    ...type.bodyStrong,
    color: colors.link,
  },
  estimate: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    fontSize: 14,
    color: colors.success,
  },
  bar: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    gap: 2,
  },
  sectionTitle: {
    ...type.sectionHeading,
    color: colors.text,
    marginBottom: 4,
  },
  sectionTitleFlat: {
    ...type.sectionHeading,
    color: colors.text,
  },
  emptyTop: {
    marginTop: 8,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  merchantText: {
    flex: 1,
    gap: 2,
  },
  merchantName: {
    ...type.bodyStrong,
    color: colors.text,
  },
  merchantNote: {
    ...type.caption,
    color: colors.textMuted,
  },
  merchantAmounts: {
    alignItems: 'flex-end',
    gap: 2,
  },
  merchantPts: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    color: colors.points,
  },
  giveaway: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3A2E6E',
    backgroundColor: '#2B1F5C',
    padding: 16,
    gap: 12,
  },
  giveawayText: {
    gap: 4,
  },
  giveawayHint: {
    ...type.caption,
    color: colors.textSecondary,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeLabel: {
    ...type.label,
    width: 76,
    color: colors.textSecondary,
  },
  codeInput: {
    flex: 1,
    height: 44,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: '#3A2E6E',
    backgroundColor: colors.tabBar,
    paddingHorizontal: 14,
    paddingVertical: 0,
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 13,
    letterSpacing: 1,
    color: colors.text,
  },
  claimMessage: {
    ...type.captionStrong,
    color: colors.success,
  },
  claimError: {
    color: colors.danger,
  },
});

export default Rewards;
