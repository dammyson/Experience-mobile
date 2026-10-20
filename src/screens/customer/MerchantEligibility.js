import React from 'react';
import {View, Text, ScrollView, StatusBar, StyleSheet, RefreshControl} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import ScreenBackground from '../../components/layout/ScreenBackground';
import AppHeader from '../../components/layout/AppHeader';
import RequestState from '../../components/layout/RequestState';
import {theme} from '../../theme/colors';
import {spacing, radius} from '../../theme/spacing';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {formatMoney, formatType} from '../../utilities/merchantActivity';
import {getSpendableSummary} from '../../utilities/spendable';
import {getMerchantId, getMerchantName} from './CheckEligibility';

const MerchantEligibility = () => {
  const navigation = useNavigation();
  const {merchant} = useRoute().params;
  const merchantId = getMerchantId(merchant);

  const {data, loading, refreshing, error, reload, refresh} = useRequest(
    () => customerAPI.getSpendable(merchantId),
    [merchantId],
  );

  const {
    points: spendablePoints,
    value: spendableValue,
    currency,
    programs,
  } = getSpendableSummary(data);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <AppHeader title={getMerchantName(merchant)} showBack onBack={() => navigation.goBack()} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#8B5CF6" />
        }>
        <RequestState loading={loading} error={!data && error} onRetry={reload} />

        {!loading && data && (
          <>
            <View style={styles.summaryCard}>
              <LinearGradient
                colors={['#885DF5', '#6B7CFE']}
                start={{x: 0, y: 0.5}}
                end={{x: 1, y: 0}}
                style={StyleSheet.absoluteFill}
              />
              <Text style={styles.summaryLabel}>Points you can spend here</Text>
              <Text style={styles.summaryValue}>{spendablePoints}</Text>
              {spendableValue != null && (
                <Text style={styles.summaryMeta}>
                  Worth {formatMoney(spendableValue, currency)}
                </Text>
              )}
            </View>

            {spendablePoints === 0 && (
              <Text style={styles.note}>
                You don't have any points you can use at {getMerchantName(merchant)} yet.
              </Text>
            )}

            {programs.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Eligible Programs</Text>
                <View style={styles.card}>
                  {programs.map((program, index) => (
                    <View
                      key={program.program_id || index}
                      style={[styles.row, index < programs.length - 1 && styles.rowBorder]}>
                      <View style={styles.rowLeft}>
                        <Text style={styles.rowTitle} numberOfLines={1}>
                          {program.program_name || 'Program'}
                        </Text>
                        {!!program.redemption_mode && (
                          <Text style={styles.rowMeta}>{formatType(program.redemption_mode)}</Text>
                        )}
                      </View>
                      <View style={styles.rowRight}>
                        <Text style={styles.rowTitle}>{program.points ?? 0} pts</Text>
                        {program.estimated_value != null && (
                          <Text style={styles.rowMeta}>
                            {formatMoney(program.estimated_value, currency)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </View>
              </>
            )}
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
  summaryMeta: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: theme.TEXT_PRIMARY,
    marginTop: 8,
  },
  note: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLeft: {
    flex: 1,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowTitle: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: theme.TEXT_PRIMARY,
  },
  rowMeta: {
    fontFamily: 'DMSans-Regular',
    fontSize: 12,
    color: theme.TEXT_TERTIARY,
    marginTop: 2,
  },
});

export default MerchantEligibility;
