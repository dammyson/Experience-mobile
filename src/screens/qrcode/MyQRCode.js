import React from 'react';
import {View, Text, TouchableOpacity, StatusBar, StyleSheet, Share} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import QRCode from 'react-native-qrcode-svg';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';

const MyQRCode = () => {
  const navigation = useNavigation();
  const {user, userType} = useSelector(state => state.auth);
  const merchantProfile = useSelector(state => state.merchant.profile);

  const isMerchant = userType === 'merchant';
  const qrValue = isMerchant ? user?.merchant_ids?.[0] : user?.id;

  const userName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : '';
  const displayName = isMerchant ? merchantProfile?.merchant?.name || userName : userName;
  const subtitle = isMerchant
    ? 'Customers can scan this code to find your business'
    : 'Show this code to a merchant to earn or redeem points';

  const handleShare = () => {
    Share.share({message: qrValue}).catch(() => {});
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <BackIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My QR Code</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        {qrValue ? (
          <>
            <Text style={styles.name}>{displayName}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>

            <View style={styles.qrCard}>
              <QRCode value={qrValue} size={220} color="#0B0B0E" backgroundColor={theme.WHITE} />
            </View>

            <Text style={styles.idLabel}>{isMerchant ? 'Merchant ID' : 'Customer ID'}</Text>
            <Text style={styles.idValue} selectable>
              {qrValue}
            </Text>

            <TouchableOpacity style={styles.ctaButton} onPress={handleShare} activeOpacity={0.85}>
              <Text style={styles.ctaText}>Share ID</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.subtitle}>Your ID isn't available. Please sign in again.</Text>
        )}
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
  },
  name: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 20,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
  },
  subtitle: {
    ...textStyles.textMd,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
    marginTop: 8,
  },
  qrCard: {
    backgroundColor: theme.WHITE,
    borderRadius: 24,
    padding: 20,
    marginTop: 32,
  },
  idLabel: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    marginTop: 28,
  },
  idValue: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
    marginTop: 4,
    textAlign: 'center',
  },
  ctaButton: {
    alignSelf: 'stretch',
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: 32,
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
});

export default MyQRCode;
