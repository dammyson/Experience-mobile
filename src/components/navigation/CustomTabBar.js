import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet, Platform} from 'react-native';
import {LiquidGlassView, isLiquidGlassSupported} from '@callstack/liquid-glass';
import {theme} from '../../theme/colors';
import HomeIcon from '../icons/HomeIcon';
import ActivityIcon from '../icons/ActivityIcon';
import ScanQRIcon from '../icons/ScanQRIcon';
import RewardsIcon from '../icons/RewardsIcon';

const PROFILE_PLACEHOLDER = require('../../assets/images/profile_placeholder.jpg');

const TABS = [
  {name: 'Home',     label: 'Home',     Icon: HomeIcon},
  {name: 'Activity', label: 'Activity', Icon: ActivityIcon},
  {name: 'ScanQR',   label: 'Scan QR',  Icon: ScanQRIcon},
  {name: 'Rewards',  label: 'Rewards',  Icon: RewardsIcon},
  {name: 'Profile',  label: 'Profile',  Icon: null}, // uses avatar image
];

const ACTIVE_COLOR   = theme.BRAND_600;   // #A777F3
const INACTIVE_COLOR = theme.TEXT_TERTIARY; // #A8A8A8

const TabItem = ({tab, isFocused, onPress}) => {
  const color = isFocused ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <TouchableOpacity style={styles.tabItem} onPress={onPress} activeOpacity={0.7}>
      {tab.Icon ? (
        <tab.Icon color={color} size={22} />
      ) : (
        <View style={[styles.avatar, isFocused && styles.avatarActive]}>
          <Image source={PROFILE_PLACEHOLDER} style={styles.avatarImage} />
        </View>
      )}
      <Text style={[styles.tabLabel, {color}]}>{tab.label}</Text>
    </TouchableOpacity>
  );
};

const CustomTabBar = ({state, navigation}) => {
  const useGlass = Platform.OS === 'ios' && isLiquidGlassSupported;

  const tabItems = (
    <View style={styles.tabRow}>
      {state.routes.map((route, index) => {
        const tab = TABS.find(t => t.name === route.name) ?? {
          name: route.name,
          label: route.name,
          Icon: null,
        };
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

        return (
          <TabItem key={route.key} tab={tab} isFocused={isFocused} onPress={onPress} />
        );
      })}
    </View>
  );

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      {useGlass ? (
        <LiquidGlassView style={styles.pill} effect="regular" colorScheme="dark">
          {tabItems}
        </LiquidGlassView>
      ) : (
        <View style={[styles.pill, styles.pillFallback]}>{tabItems}</View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
  },
  pill: {
    borderRadius: 48,
    overflow: 'hidden',
  },
  pillFallback: {
    backgroundColor: 'rgba(20, 20, 28, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabLabel: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    lineHeight: 14,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 9999,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  avatarActive: {
    borderColor: ACTIVE_COLOR,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
  },
});

export default CustomTabBar;
