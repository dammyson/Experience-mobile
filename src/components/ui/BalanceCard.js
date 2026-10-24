import React, {useEffect, useRef, useState} from 'react';
import {View, Text, TouchableOpacity, ActivityIndicator, StyleSheet} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {showMessage} from 'react-native-flash-message';
import Icon from '../icons/Icon';
import {formatNaira, formatNumber} from '../../utilities/format';
import {colors, type, radii} from '../../theme/tokens';

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
 *   onRefresh () => void | Promise — shows a small refresh icon by the label;
 *             a spinner replaces it until a returned promise settles
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
  onRefresh,
  children,
  style,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const mounted = useRef(true);

  useEffect(() => () => {
    mounted.current = false;
  }, []);

  const handleRefresh = async () => {
    if (refreshing) {
      return;
    }
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      // Screens show their own errors
    } finally {
      if (mounted.current) {
        setRefreshing(false);
      }
    }
  };

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
    <View style={[styles.card, style]}>
      <View style={styles.top}>
        <View style={styles.labelBlock}>
          <View style={styles.labelRow}>
            <Text style={styles.label}>{label}</Text>
            {!!onRefresh && (
              <TouchableOpacity
                onPress={handleRefresh}
                disabled={refreshing}
                accessibilityRole="button"
                accessibilityLabel={`Refresh ${label}`}
                accessibilityState={{busy: refreshing}}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
                activeOpacity={0.7}>
                {refreshing ? (
                  <ActivityIndicator size="small" color={colors.textOnBrand} style={styles.refreshIcon} />
                ) : (
                  <Icon name="sync" size={14} color={colors.textOnBrand} strokeWidth={2.2} />
                )}
              </TouchableOpacity>
            )}
          </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.balance,
    padding: 18,
    overflow: 'hidden',
    gap: 16,
    backgroundColor: '#5B3FD9',
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textOnBrand,
  },
  refreshIcon: {
    width: 14,
    height: 14,
    transform: [{scale: 0.7}],
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
