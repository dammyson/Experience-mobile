import React from 'react';
import {View, Text, ScrollView, StatusBar, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import RequestState from '../../components/layout/RequestState';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {formatMoney, formatType} from '../../utilities/merchantActivity';

const ProgramRow = ({program, currency, isLast}) => (
  <View style={[styles.programRow, !isLast && styles.programBorder]}>
    <View style={styles.programLeft}>
      <Text style={styles.programName} numberOfLines={1}>
        {program.program_name}
      </Text>
      <Text style={styles.programMeta}>
        {[
          program.point_value != null && `1 pt = ${formatMoney(program.point_value, currency)}`,
          formatType(program.redemption_mode),
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
    </View>
    <View style={styles.programRight}>
      <Text style={styles.programPoints}>{program.points} pts</Text>
      <Text style={styles.programMeta}>{formatMoney(program.estimated_value, currency)}</Text>
    </View>
  </View>
);

const MerchantCard = ({merchant, currency}) => {
  const programs = merchant.programs || [];
  return (
    <View style={styles.merchantCard}>
      <View style={styles.merchantTop}>
        <Text style={styles.merchantName} numberOfLines={1}>
          {merchant.merchant_name}
        </Text>
        <Text style={styles.merchantPoints}>{merchant.points} pts</Text>
      </View>
      <Text style={styles.merchantValue}>
        Est. value {formatMoney(merchant.estimated_value, currency)}
      </Text>

      {programs.length > 0 && (
        <View style={styles.programs}>
          {programs.map((program, index) => (
            <ProgramRow
              key={program.program_id}
              program={program}
              currency={currency}
              isLast={index === programs.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const MyPoints = () => {
  const navigation = useNavigation();
  const {data, loading, refreshing, error, reload, refresh} = useRequest(
    () => customerAPI.getPointsByMerchant(),
    [],
  );

  const merchants = data?.merchants || [];
  const currency = data?.currency || 'NGN';

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AppHeader title="My Points" showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8B5CF6" />
        }>
        <RequestState
          loading={loading}
          error={!data && error}
          empty={!!data && merchants.length === 0}
          emptyText="No points yet"
          emptySubtext="Points you earn from merchants will appear here"
          onRetry={reload}
        />

        {!loading && data && (
          <>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#885DF5', '#6B7CFE']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.summaryLabel}>Total Points</Text>
              <Text style={styles.summaryValue}>{data.total_points ?? 0}</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryMeta}>
                  Est. value {formatMoney(data.total_estimated_value, currency)}
                </Text>
                <Text style={styles.summaryMeta}>
                  {data.merchant_count ?? merchants.length} merchant
                  {(data.merchant_count ?? merchants.length) === 1 ? '' : 's'}
                </Text>
              </View>
            </View>

            {merchants.length > 0 && <Text style={styles.sectionTitle}>By Merchant</Text>}
            {merchants.map(merchant => (
              <MerchantCard key={merchant.merchant_id} merchant={merchant} currency={currency} />
            ))}
          </>
        )}
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  summaryCard: {
    borderRadius: 23,
    padding: 20,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  summaryLabel: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  summaryValue: {
    fontFamily: 'DMSans-Bold',
    fontSize: 32,
    color: theme.WHITE,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  summaryMeta: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: theme.TEXT_PRIMARY,
  },
  sectionTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginBottom: 12,
  },
  merchantCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 16,
    marginBottom: 12,
  },
  merchantTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  merchantName: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    flex: 1,
  },
  merchantPoints: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
  },
  merchantValue: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: theme.TEXT_TERTIARY,
    marginTop: 4,
  },
  programs: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 12,
  },
  programBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  programLeft: {
    flex: 1,
  },
  programRight: {
    alignItems: 'flex-end',
  },
  programName: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  programPoints: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  programMeta: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    marginTop: 2,
  },
});

export default MyPoints;
