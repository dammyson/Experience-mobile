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
  SuccessCheckIcon,
  DownloadPDFIcon,
  ShareIcon,
  FlagIcon,
} from '../../components/icons';
import {theme} from '../../theme/colors';

const DetailRow = ({label, value, valueColor}) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={[styles.detailValue, valueColor && {color: valueColor}]}>{value}</Text>
  </View>
);

const PaymentStatus = () => {
  const navigation = useNavigation();
  const route = useRoute();

  // Get transaction data from route params or use defaults
  const transaction = route.params?.transaction || {
    status: 'Success',
    nameTransaction: 'Reward Redeemed',
    amount: '-20 points(₦100)',
    txId: 'TF457RF6HF',
    date: '20:14 — 01 Dec 2025',
    type: 'Online',
  };

  const isSuccess = transaction.status === 'Success';

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Status</Text>
        </View>

        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <SuccessCheckIcon size={80} />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>Reward claimed successfully</Text>
        <Text style={styles.successSubtitle}>Your data package is now active</Text>

        {/* Details */}
        <View style={styles.detailsContainer}>
          <DetailRow
            label="Status"
            value={transaction.status}
            valueColor={isSuccess ? theme.SUCCESS_COLOR : theme.ERROR_COLOR}
          />
          <DetailRow label="Name Transaction" value={transaction.nameTransaction} />
          <DetailRow label="Amount" value={transaction.amount} />
          <DetailRow label="Transaction ID" value={transaction.txId} />
          <DetailRow label="Date" value={transaction.date} />
          <DetailRow label="Type" value={transaction.type} />
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
        <TouchableOpacity
          style={styles.shareBtn}
          activeOpacity={0.8}
          onPress={() => navigation.popToTop()}>
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
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 22,
    color: theme.TEXT_PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    color: theme.TEXT_SECONDARY,
    textAlign: 'center',
    marginBottom: 32,
  },
  detailsContainer: {
    paddingHorizontal: 16,
    gap: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
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
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    marginTop: 24,
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

export default PaymentStatus;
