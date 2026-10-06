import React from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import BellIcon from '../icons/BellIcon';
import WalletIcon from '../icons/WalletIcon';
import ProfileIcon from '../icons/ProfileIcon';
import {theme} from '../../theme/colors';

const HomeHeader = ({
  name = 'Sarah',
  avatarUri,
  onProfile,
  onNotification,
  onWallet,
  hasNotification = true,
}) => (
  <View style={styles.container}>
    {/* Left side - Profile avatar and greeting */}
    <View style={styles.leftSection}>
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={onProfile}
        activeOpacity={0.8}>
        {avatarUri ? (
          <Image source={{uri: avatarUri}} style={styles.avatarImage} />
        ) : (
          <ProfileIcon color={theme.WHITE} size={16} />
        )}
      </TouchableOpacity>

      <View style={styles.greetingContainer}>
        <Text style={styles.greetingText}>Hello, {name}</Text>
      </View>
    </View>

    {/* Right side - Notification and Wallet */}
    <View style={styles.rightSection}>
      {/* Notification bell */}
      <TouchableOpacity
        style={styles.bellBtn}
        onPress={onNotification}
        activeOpacity={0.8}>
        <BellIcon color={theme.TEXT_PRIMARY} size={20} />
        {hasNotification && <View style={styles.notifDot} />}
      </TouchableOpacity>

      {/* Wallet button */}
      <TouchableOpacity
        style={styles.walletBtn}
        onPress={onWallet}
        activeOpacity={0.8}>
        <View style={styles.walletIconBox}>
          <WalletIcon color={theme.BACKGROUND_COLOR} size={16} />
        </View>
        <Text style={styles.walletText}>Wallet</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 22,
  },
  greetingContainer: {
    marginLeft: 8,
  },
  greetingText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    lineHeight: 32,
    color: theme.TEXT_PRIMARY,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingLeft: 8,
    paddingRight: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 20,
  },
  walletIconBox: {
    width: 23,
    height: 23,
    borderRadius: 16,
    backgroundColor: theme.TEXT_PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 11,
    lineHeight: 24,
    color: theme.TEXT_PRIMARY,
  },
  bellBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.ERROR_BADGE,
  },
});

export default HomeHeader;
