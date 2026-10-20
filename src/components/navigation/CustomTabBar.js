import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from '../icons/Icon';
import ScanQRIcon from '../icons/ScanQRIcon';
import {colors, fonts} from '../../theme/tokens';

// Route name → label + icon. Covers the customer and merchant tab sets.
const TABS = {
  Home: {label: 'Home', icon: 'home'},
  Explore: {label: 'Explore', icon: 'explore'},
  Rewards: {label: 'Rewards', icon: 'rewards'},
  Wallet: {label: 'Wallet', icon: 'wallet'},
  Profile: {label: 'Profile', icon: 'profile'},
  Overview: {label: 'Overview', icon: 'overview'},
  Programs: {label: 'Programs', icon: 'programs'},
  Customers: {label: 'Customers', icon: 'customers'},
  Activity: {label: 'Activity', icon: 'activity'},
  Business: {label: 'Business', icon: 'business'},
  ScanQR: {label: 'Scan QR', Component: ScanQRIcon},
};

const TabItem = ({routeName, isFocused, onPress}) => {
  const tab = TABS[routeName] ?? {label: routeName};
  const color = isFocused ? colors.link : colors.tabInactive;

  return (
    <TouchableOpacity
      style={styles.tabItem}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{selected: isFocused}}
      accessibilityLabel={tab.label}>
      {tab.icon && <Icon name={tab.icon} size={22} color={color} strokeWidth={isFocused ? 2 : 1.8} />}
      {tab.Component && <tab.Component color={color} size={22} />}
      <Text style={[styles.tabLabel, {color}]}>{tab.label}</Text>
    </TouchableOpacity>
  );
};

/**
 * Flat bottom tab bar from the redesign (Android and iOS < 26; iOS 26+ uses
 * the native glass bar in tabs-navigation.js).
 */
const CustomTabBar = ({state, navigation}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 12)}]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return <TabItem key={route.key} routeName={route.name} isFocused={isFocused} onPress={onPress} />;
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.tabBar,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 11,
    lineHeight: 14,
  },
});

export default CustomTabBar;
