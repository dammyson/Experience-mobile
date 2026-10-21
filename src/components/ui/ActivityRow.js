import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Icon from '../icons/Icon';
import {colors, type, radii} from '../../theme/tokens';

/**
 * One activity / transaction row.
 *
 * Variants:
 *   'list' — round initials avatar, divider below (Home recent activity)
 *   'card' — icon chip inside a card (merchant Activity, Wallet)
 *
 * Props:
 *   title        string
 *   subtitle     string
 *   amount       string — already formatted (use utilities/format)
 *   amountColor  string — points lavender, money white, pending amber…
 *   initials     string — leading avatar (list) / badge
 *   icon         Icon name — leading chip (card)
 *   iconColor    string
 *   iconBg       string
 *   status       {label, color} — small status text under the amount
 *   action       {label, onPress} — link under the amount (e.g. "Reverse")
 *   onPress      () => void — makes the whole row tappable
 *   variant      'list' | 'card' (default 'card')
 */
const ActivityRow = ({
  title,
  subtitle,
  amount,
  amountColor = colors.text,
  initials,
  icon,
  iconColor = colors.points,
  iconBg = colors.pointsBg,
  status,
  action,
  onPress,
  variant = 'card',
}) => {
  const isList = variant === 'list';
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[title, subtitle, amount, status?.label].filter(Boolean).join(', ')}
      style={isList ? styles.listRow : styles.cardRow}>
      {icon ? (
        <View style={[styles.iconChip, {backgroundColor: iconBg}]}>
          <Icon name={icon} size={16} color={iconColor} strokeWidth={2} />
        </View>
      ) : (
        <View style={isList ? styles.avatar : styles.badge}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
      )}

      <View style={styles.middle}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {!!subtitle && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, {color: amountColor}]}>{amount}</Text>
        {!!status && <Text style={[styles.status, {color: status.color}]}>{status.label}</Text>}
        {!!action && (
          <TouchableOpacity
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={`${action.label} ${title}`}
            hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
            <Text style={styles.action}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1D1D27',
    borderWidth: 1,
    borderColor: colors.borderTile,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    ...type.captionStrong,
    color: '#D9D9E3',
  },
  middle: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...type.bodyStrong,
    color: colors.text,
  },
  subtitle: {
    ...type.caption,
    color: colors.textMuted,
  },
  right: {
    alignItems: 'flex-end',
    gap: 3,
  },
  amount: {
    ...type.amount,
  },
  status: {
    ...type.captionStrong,
  },
  action: {
    ...type.captionStrong,
    color: colors.link,
  },
});

export default ActivityRow;
