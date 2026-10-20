import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme/colors';

const CartIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M3 3H5L5.4 5M5.4 5H21L17 13H7M5.4 5L7 13M7 13L4.7 15.3C4.1 15.9 4.5 17 5.4 17H17M17 17C15.9 17 15 17.9 15 19C15 20.1 15.9 21 17 21C18.1 21 19 20.1 19 19C19 17.9 18.1 17 17 17ZM9 19C9 20.1 8.1 21 7 21C5.9 21 5 20.1 5 19C5 17.9 5.9 17 7 17C8.1 17 9 17.9 9 19Z"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const GiftIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M20 12V22H4V12M22 7H2V12H22V7ZM12 22V7M12 7H7.5C6.1 7 5 5.9 5 4.5C5 3.1 6.1 2 7.5 2C11 2 12 7 12 7ZM12 7H16.5C17.9 7 19 5.9 19 4.5C19 3.1 17.9 2 16.5 2C13 2 12 7 12 7Z"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ListIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M8 6H21M8 12H21M8 18H21M3 6H3.01M3 12H3.01M3 18H3.01"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const StarIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const CheckCircleIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C13.57 2 15.06 2.36 16.38 3.01M22 4L12 14.01L9 11.01"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ReceiptIcon = () => (
  <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 2V22L7 20L10 22L12 20.5L14 22L17 20L20 22V2L17 4L14 2L12 3.5L10 2L7 4L4 2ZM8 8H16M8 12H16M8 16H13"
      stroke={theme.TEXT_PRIMARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ActionButton = ({icon, label, onPress}) => (
  <TouchableOpacity style={styles.action} onPress={onPress} activeOpacity={0.8}>
    <View style={styles.iconCircle}>{icon}</View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

export const QuickActionIcons = {
  cart: <CartIcon />,
  gift: <GiftIcon />,
  list: <ListIcon />,
  star: <StarIcon />,
  check: <CheckCircleIcon />,
  receipt: <ReceiptIcon />,
};

/**
 * Row of round icon buttons inside a card.
 *
 * Props:
 *   title    string
 *   actions  [{key, label, icon, onPress}] — `icon` is any element, e.g. QuickActionIcons.cart
 */
const QuickActionsSection = ({title = 'Quick Actions', actions}) => (
  <View style={styles.container}>
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.actions}>
        {actions.map(action => (
          <ActionButton
            key={action.key}
            icon={action.icon}
            label={action.label}
            onPress={action.onPress}
          />
        ))}
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  sectionTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 16,
    lineHeight: 24,
    color: theme.WHITE,
    marginTop: 7,
    marginBottom: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.PRIMARY_GLASS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
});

export default QuickActionsSection;
