import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import {showMessage} from 'react-native-flash-message';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {ConfirmSheet, KeyValueList, Skeleton} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {useMerchantId, readGiveaway, readMerchantProfile} from '../../utilities/merchantData';
import {formatNumber, formatActivityDate} from '../../utilities/format';
import {colors, gradients, type, radii} from '../../theme/tokens';

/**
 * Giveaway code and claim status. Params: {giveawayId, name, initial?}
 */
const Giveaway = () => {
  const navigation = useNavigation();
  const {giveawayId, name, initial} = useRoute().params;
  const merchantId = useMerchantId();
  const profile = useSelector(state => state.merchant.profile);
  const statusReq = useRequest(() => merchantAPI.getGiveawayStatus(merchantId, giveawayId), [merchantId, giveawayId]);
  const [closing, setClosing] = useState(false);

  // The status response may omit the code, so fall back to the create response
  const g = readGiveaway({...(initial?.giveaway ?? initial ?? {}), ...(statusReq.data?.giveaway ?? statusReq.data ?? {})});
  const title = g.name !== 'Giveaway' ? g.name : name || 'Giveaway';
  const business = readMerchantProfile(profile).name;
  const pct = g.maxClaims ? Math.min(1, g.claims / g.maxClaims) : 0;

  const copyCode = () => {
    Clipboard.setString(g.code);
    showMessage({message: 'Code copied', type: 'success'});
  };

  const handleClose = async () => {
    try {
      await merchantAPI.closeGiveaway(merchantId, giveawayId);
      setClosing(false);
      showMessage({message: 'Giveaway closed', type: 'success'});
      statusReq.reload();
    } catch (err) {
      setClosing(false);
      showMessage({message: err.message || "The giveaway couldn't be closed.", type: 'danger'});
    }
  };

  return (
    <>
      <FormLayout
        title={title}
        onBack={() => navigation.goBack()}
        headerRight={
          !statusReq.loading && (
            <View style={[styles.statusChip, g.active ? styles.statusOn : styles.statusOff]}>
              <Text style={[styles.statusText, {color: g.active ? colors.successText : colors.textSecondary}]}>
                {g.active ? 'Active' : 'Closed'}
              </Text>
            </View>
          )
        }
        contentStyle={styles.content}
        footer={
          g.active &&
          !statusReq.loading && (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setClosing(true)}
              accessibilityRole="button"
              activeOpacity={0.8}>
              <Text style={styles.closeText}>Close giveaway</Text>
            </TouchableOpacity>
          )
        }>
        {statusReq.loading && !initial ? (
          <Skeleton height={190} radius={radii.balance} />
        ) : statusReq.error && !initial ? (
          <RequestState error={statusReq.error} onRetry={statusReq.reload} />
        ) : (
          <>
            <LinearGradient
              colors={gradients.brandCard.colors}
              locations={gradients.brandCard.locations}
              start={gradients.brandCard.start}
              end={gradients.brandCard.end}
              style={styles.codeCard}>
              <Text style={styles.codeLabel}>Share this code with customers</Text>
              <Text style={styles.code} selectable accessibilityLabel={`Code ${g.code.split('').join(' ')}`}>
                {g.code || '—'}
              </Text>
              <Text style={styles.codeSub}>
                {[g.perClaim != null && `${formatNumber(g.perClaim)} pts each`, `redeemable at ${business}`]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              {!!g.code && (
                <TouchableOpacity style={styles.copyBtn} onPress={copyCode} accessibilityRole="button" activeOpacity={0.85}>
                  <Icon name="copy" size={16} color={colors.white} />
                  <Text style={styles.copyText}>Copy code</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>

            <View style={styles.card}>
              <View style={styles.claimsTop}>
                <Text style={styles.cardTitle} accessibilityRole="header">
                  Claims
                </Text>
                <Text style={styles.claimsCount}>
                  <Text style={styles.claimsStrong}>{formatNumber(g.claims)}</Text>
                  {g.maxClaims != null ? ` of ${formatNumber(g.maxClaims)} customers` : ' customers'}
                </Text>
              </View>
              {g.maxClaims != null && (
                <View style={styles.track} importantForAccessibility="no">
                  <View style={[styles.fill, {width: `${Math.round(pct * 100)}%`}]} />
                </View>
              )}
              <KeyValueList
                rows={[
                  g.pointsGiven != null && {label: 'Points given', value: formatNumber(g.pointsGiven), color: colors.points},
                  g.spotsLeft != null && {label: 'Spots left', value: formatNumber(g.spotsLeft)},
                  {label: 'Expiry', value: g.expiry ? formatActivityDate(g.expiry) : 'Never'},
                ]}
              />
            </View>

            <Text style={styles.note}>
              Customers enter the code under Rewards → “Have a giveaway code?”. Closing stops new claims; points already
              claimed stay with customers.
            </Text>
          </>
        )}
      </FormLayout>

      <ConfirmSheet
        visible={closing}
        title={`Close ${title}?`}
        note="Customers can't claim this code once it's closed. Points already claimed stay with them."
        editLabel="Cancel"
        confirmLabel="Close giveaway"
        destructive
        onConfirm={handleClose}
        onClose={() => setClosing(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 18,
  },
  statusChip: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    marginRight: 8,
  },
  statusOn: {
    backgroundColor: colors.successBg,
  },
  statusOff: {
    backgroundColor: colors.borderCard,
  },
  statusText: {
    ...type.captionStrong,
  },
  codeCard: {
    borderRadius: radii.balance,
    padding: 20,
    alignItems: 'center',
    gap: 10,
    overflow: 'hidden',
  },
  codeLabel: {
    ...type.label,
    color: colors.textOnBrand,
  },
  code: {
    fontFamily: type.balance.fontFamily,
    fontSize: 24,
    letterSpacing: 2,
    color: colors.white,
    textAlign: 'center',
  },
  codeSub: {
    ...type.caption,
    color: colors.textOnBrand,
    textAlign: 'center',
  },
  copyBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: radii.input,
    backgroundColor: 'rgba(10,10,15,0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  copyText: {
    ...type.bodyStrong,
    color: colors.white,
  },
  card: {
    padding: 16,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    gap: 12,
  },
  claimsTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    ...type.sectionHeading,
    color: colors.text,
  },
  claimsCount: {
    ...type.label,
    color: colors.textSecondary,
  },
  claimsStrong: {
    fontFamily: type.balance.fontFamily,
    color: colors.text,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderCard,
    overflow: 'hidden',
  },
  fill: {
    height: 8,
    backgroundColor: colors.primaryBorder,
  },
  note: {
    ...type.caption,
    lineHeight: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  closeBtn: {
    height: 50,
    borderRadius: radii.cta,
    borderWidth: 1,
    borderColor: '#4A2530',
    backgroundColor: 'rgba(245,142,155,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    ...type.bodyStrong,
    color: colors.danger,
  },
});

export default Giveaway;
