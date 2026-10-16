import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Share,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {
  BackIcon,
  DownloadPDFIcon,
  ShareIcon,
  FlagIcon,
} from '../../components/icons';
import {theme} from '../../theme/colors';
import {formatMoney, formatType} from '../../utilities/merchantActivity';
import {
  formatEntryType,
  formatPoints,
  formatValue,
  isEarned,
} from '../../utilities/customerTransaction';

const DetailRow = ({label, value, hasBorder = true}) => (
  <View style={[styles.detailRow, hasBorder && styles.detailRowBorder]}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const formatDateTime = value =>
  value
    ? new Date(value).toLocaleString('en-GB', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

const TransactionDetails = () => {
  const navigation = useNavigation();
  const {transaction = {}, merchantName = 'Merchant', programName, history} = useRoute().params || {};

  const earned = isEarned(transaction);
  const detailRows = [
    {label: 'Type', value: formatEntryType(transaction)},
    programName && {label: 'Program', value: programName},
    transaction.balance_after != null && {
      label: 'Balance After',
      value: `${transaction.balance_after} points`,
    },
    transaction.reference_type && {
      label: 'Reference Type',
      value: formatType(transaction.reference_type),
    },
    transaction.reference_id && {label: 'Reference', value: transaction.reference_id},
    {label: 'ID Transaction', value: transaction.id || 'N/A'},
  ].filter(Boolean);

  const handleShare = () => {
    Share.share({
      message: [
        `${merchantName} — ${formatEntryType(transaction)}`,
        `${formatPoints(transaction)} (${formatValue(transaction)})`,
        formatDateTime(transaction.created_at),
        `Transaction ID: ${transaction.id}`,
      ].join('\n'),
    }).catch(() => {});
  };

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
        <Text style={styles.dateText}>{formatDateTime(transaction.created_at)}</Text>

        {/* Main Info */}
        <View style={styles.mainInfo}>
          <View style={styles.mainInfoRow}>
            <Text style={styles.merchantName}>{merchantName}</Text>
            <Text style={styles.pointsValue}>{formatPoints(transaction)}</Text>
          </View>
          <View style={styles.mainInfoRow}>
            <Text style={styles.epvLabel}>Est. Point Value</Text>
            <Text style={styles.epvValue}>{formatValue(transaction)}</Text>
          </View>
          <View style={styles.mainInfoRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={[styles.statusValue, earned && styles.statusSuccess]}>
              {earned ? 'Earned' : 'Redeemed'}
            </Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>DETAILS</Text>
          <View style={styles.detailsCard}>
            {detailRows.map((row, index) => (
              <DetailRow
                key={row.label}
                label={row.label}
                value={row.value}
                hasBorder={index < detailRows.length - 1}
              />
            ))}
          </View>
        </View>

        {/* History Section */}
        {history && (
          <View style={styles.historySection}>
            <Text style={styles.historySectionTitle}>
              HISTORY WITH {merchantName.toUpperCase()}
            </Text>
            <View style={styles.historyCard}>
              <View style={styles.historyRow}>
                <Text style={styles.historyLabel}>Number of transactions</Text>
                <Text style={styles.historyValue}>{history.count}</Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyRow}>
                <View>
                  <Text style={styles.historyLabel}>Total earned</Text>
                  <Text style={styles.historySubLabel}>{history.earnedPoints} points</Text>
                </View>
                <Text style={styles.historyValue}>{formatMoney(history.earnedValue, 'NGN')}</Text>
              </View>
              <View style={styles.historyDivider} />
              <View style={styles.historyRow}>
                <View>
                  <Text style={styles.historyLabel}>Total redeemed</Text>
                  <Text style={styles.historySubLabel}>{history.redeemedPoints} points</Text>
                </View>
                <Text style={styles.historyValue}>
                  {formatMoney(history.redeemedValue, 'NGN')}
                </Text>
              </View>
            </View>
          </View>
        )}

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
        <TouchableOpacity style={styles.shareBtn} activeOpacity={0.8} onPress={handleShare}>
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
