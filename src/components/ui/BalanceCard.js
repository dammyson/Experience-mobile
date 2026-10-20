import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Clipboard from '@react-native-clipboard/clipboard';
import {showMessage} from 'react-native-flash-message';
import Icon from '../icons/Icon';
import {formatNaira, formatNumber} from '../../utilities/format';
import {colors, gradients, type, radii} from '../../theme/tokens';

/**
 * Brand gradient card with a large balance.
 *
 * Props:
 *   label     string — e.g. "Available balance"
 *   amount    number
 *   kind      'money' | 'points' (default 'money')
 *   currency  string (default 'NGN')
 *   caption   string — small line under the amount ("across 6 merchants")
 *   account   {bank, name, number} — inner account row with a copy button
 *   right     ReactNode — top-right slot (e.g. the logo)
 *   children  ReactNode — extra content at the bottom (e.g. a link row)
 *   style     extra style
 */
const BalanceCard = ({
  label,
  amount,
  kind = 'money',
  currency = 'NGN',
  caption,
  account,
  right,
  children,
  style,
}) => {
  const copyAccount = () => {
    Clipboard.setString(account.number);
    showMessage({message: 'Account number copied', type: 'success'});
  };

  let display;
  if (kind === 'points') {
    display = (
      <Text style={styles.amount} accessibilityLabel={`${formatNumber(amount)} points`}>
        {formatNumber(amount)} <Text style={styles.ptsSuffix}>pts</Text>
      </Text>
    );
  } else {
    const [whole, fraction] = formatNaira(amount, {currency}).split('.');
    display = (
      <Text style={styles.amount} accessibilityLabel={formatNaira(amount, {currency})}>
        {whole}
        <Text style={styles.fraction}>.{fraction}</Text>
      </Text>
    );
  }

  return (
    <LinearGradient
      colors={gradients.brandCard.colors}
      locations={gradients.brandCard.locations}
      start={gradients.brandCard.start}
      end={gradients.brandCard.end}
      style={[styles.card, style]}>
      <View style={styles.ring} pointerEvents="none" />
      <View style={styles.top}>
        <View style={styles.labelBlock}>
          <Text style={styles.label}>{label}</Text>
          {display}
          {!!caption && <Text style={styles.caption}>{caption}</Text>}
        </View>
        {right}
      </View>

      {!!account?.number && (
        <View style={styles.accountRow}>
          <View style={styles.accountText}>
            <Text style={styles.caption} numberOfLines={1}>
              {[account.bank, account.name].filter(Boolean).join(' · ')}
            </Text>
            <Text style={styles.accountNumber}>{account.number.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3')}</Text>
          </View>
          <TouchableOpacity
            onPress={copyAccount}
            style={styles.copyBtn}
            accessibilityRole="button"
            accessibilityLabel="Copy account number"
            activeOpacity={0.7}>
            <Icon name="copy" size={18} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {children}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.balance,
    padding: 18,
    gap: 18,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    right: -40,
    top: -50,
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 28,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelBlock: {
    gap: 4,
    flexShrink: 1,
  },
  label: {
    ...type.label,
    color: colors.textOnBrand,
  },
  amount: {
    ...type.balance,
    color: colors.white,
  },
  fraction: {
    fontSize: 16,
    color: colors.textOnBrand,
  },
  ptsSuffix: {
    ...type.button,
    color: '#7FF0C8',
  },
  caption: {
    ...type.caption,
    color: colors.textOnBrand,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  accountText: {
    gap: 2,
    flexShrink: 1,
  },
  accountNumber: {
    ...type.button,
    ...type.tabular,
    color: colors.white,
    letterSpacing: 1.4,
  },
  copyBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.input,
    backgroundColor: 'rgba(10,10,15,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default BalanceCard;
