import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {
  BackIcon,
  CheckIcon,
  DownloadPDFIcon,
  ShareIcon,
  FlagIcon,
} from '../../components/icons';
import {theme} from '../../theme/colors';

const DetailRow = ({label, value, hasBorder = true}) => (
  <View style={[styles.detailRow, hasBorder && styles.detailRowBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const TransactionDetails = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get transaction data from route params or use defaults
  const transaction = route.params?.transaction || {
    date: '01 December 2025',
    merchant: 'Air Peace Airline Rewards',
    points: '-20',
    epv: '-₦100',
    status: 'Redeemed',
    reference: 'Ayobami Ayemi',
    txId: 'TF457RF6HF',
    redeemType: 'Online',
    location: 'Abuja',
    totalTransactions: 65,
    totalReceived: '₦2,500',
    totalReceivedRewards: 25,
    totalRedeemed: '₦10,500',
    totalRedeemedRewards: 40,
  };

  const isSuccess = transaction.status === 'Redeemed' || transaction.status === 'Success' || transaction.status === 'Earned';

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}>
            <BackIcon size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Date */}
        <Text style={styles.dateText}>{transaction.date}</Text>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.mainInfoRow}>
            <Text style={styles.merchantName}>{transaction.merchant}</Text>
            <Text style={styles.pointsValue}>{transaction.points}</Text>
          </View>
          <View style={styles.mainInfoRow}>
            <Text style={styles.epvLabel}>Est. Point Value</Text>
            <Text style={styles.epvValue}>{transaction.epv}</Text>
          </View>
          <View style={styles.mainInfoRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, isSuccess && styles.statusSuccess]}>
              {transaction.status}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>DETAILS</Text>
          <View style={styles.detailsCard}>
            <DetailRow label="Reference" value={transaction.reference} />
            <DetailRow label="ID Transaction" value={transaction.txId} />
            <DetailRow label="Redeem Type" value={transaction.redeemType} />
            <DetailRow label="Location" value={transaction.location} hasBorder={false} />
          </View>
        </View>

        {/* Success Message */}
        {isSuccess && (
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <Text style={styles.successTitle}>Reward claimed successfully</Text>
              <View style={styles.successCheck}>
                <CheckIcon size={20} />
              </View>
            </View>
            <Text style={styles.successText}>
              Your reward has been redeemed successfully.
            </Text>
            <Text style={styles.successSubtext}>
              Most redemptions are processed within seconds, but it may take up to 2 hours for the reward to appear in your account.
            </Text>
          </View>
        )}

        {/* History Section */}
        <View style={styles.historySection}>
          <Text style={styles.historySectionTitle}>
            HISTORY WITH {transaction.merchant.toUpperCase()}
          </Text>
          <View style={styles.historyCard}>
            <View style={styles.historyRow}>
              <Text style={styles.historyLabel}>Number of transactions</Text>
              <Text style={styles.historyValue}>{transaction.totalTransactions}</Text>
            </View>
            <View style={styles.historyDivider} />
            <View style={styles.historyRow}>
              <View>
                <Text style={styles.historyLabel}>Total received</Text>
                <Text style={styles.historySubLabel}>{transaction.totalReceivedRewards} rewards</Text>
              </View>
              <Text style={styles.historyValue}>{transaction.totalReceived}</Text>
            </View>
            <View style={styles.historyDivider} />
            <View style={styles.historyRow}>
              <View>
                <Text style={styles.historyLabel}>Total redeemed</Text>
                <Text style={styles.historySubLabel}>{transaction.totalRedeemedRewards} rewards</Text>
              </View>
              <Text style={styles.historyValue}>{transaction.totalRedeemed}</Text>
            </View>
          </View>
        </View>

        {/* Report Problem */}
        <TouchableOpacity style={styles.reportBtn} activeOpacity={0.7}>
          <FlagIcon size={20} />
          <Text style={styles.reportText}>Report Problem</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.downloadBtn} activeOpacity={0.8}>
          <Text style={styles.downloadBtnText}>Download PDF</Text>
          <DownloadPDFIcon size={20} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8}>
          <Text style={styles.shareBtnText}>Share</Text>
          <ShareIcon size={20} />
        </TouchableOpacity>
      </View>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
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
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  dateText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
    marginBottom: 20,
  },
  mainInfo: {
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 24,
  },
  mainInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  merchantName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
    flex: 1,
  },
  pointsValue: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 24,
    color: theme.TEXT_PRIMARY,
  },
  epvLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  epvValue: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  statusLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  statusValue: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  statusSuccess: {
    color: theme.TEXT_PRIMARY,
  },
  detailsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  detailsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  detailValue: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  successCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  successHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginRight: 8,
  },
  successCheck: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: 'rgba(32, 187, 89, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_SECONDARY,
    marginBottom: 8,
  },
  successSubtext: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    lineHeight: 20,
  },
  historySection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  historySectionTitle: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  historyCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 16,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 12,
  },
  historyLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  historySubLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 12,
    color: theme.TEXT_MUTED,
    marginTop: 2,
  },
  historyValue: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 20,
  },
  reportText: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: '#E53935',
  },
  bottomButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 34,
    gap: 12,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  downloadBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  downloadBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  shareBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6715EA',
    borderRadius: 28,
    paddingVertical: 14,
  },
  shareBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.WHITE,
  },
});

export default TransactionDetails;
