import React, {useCallback, useEffect, useMemo} from 'react';
import {View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenBackground from '../../components/layout/ScreenBackground';
import RequestState from '../../components/layout/RequestState';
import {BalanceCard, ChoiceTile, EmptyState, SkeletonCard, SkeletonList} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import ProgramCard from '../../components/merchant/ProgramCard';
import {useTabContext} from '../../navigations/TabContext';
import {getMerchantProfile, getMerchantPrograms, getMerchantWallet} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import useProgramBalances from '../../utilities/useProgramBalances';
import {useMerchantId, readPrograms, readMerchantProfile, isOpen} from '../../utilities/merchantData';
import {initials} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, layout} from '../../theme/tokens';

const ACTIONS = [
  {id: 'award', label: 'Award points', icon: 'plus', route: 'AwardPoints', primary: true},
  {id: 'program', label: 'New program', icon: 'newProgram', route: 'CreateProgram'},
  {id: 'giveaway', label: 'Giveaway', icon: 'ticket', route: 'Promotions'},
  {id: 'purchase', label: 'Purchase', icon: 'receipt', route: 'CreateOrder'},
];

const Overview = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {switchTab} = useTabContext();
  const merchantId = useMerchantId();
  const user = useSelector(state => state.auth.user);
  const {wallet, walletLoading, profile, programs, programsLoading, error} = useSelector(state => state.merchant);

  const safeHaven = useRequest(
    () => (merchantId ? merchantAPI.getAccountBalance(merchantId) : Promise.resolve({data: null})),
    [merchantId],
  );

  const load = useCallback(
    (force = false) => {
      if (!merchantId) {
        return;
      }
      dispatch(getMerchantProfile(merchantId, force)).catch(() => {});
      dispatch(getMerchantWallet(merchantId, force)).catch(() => {});
      dispatch(getMerchantPrograms(merchantId, force)).catch(() => {});
    },
    [dispatch, merchantId],
  );

  useEffect(() => {
    load();
  }, [load]);

  const programList = useMemo(() => readPrograms(programs).filter(isOpen).slice(0, 3), [programs]);
  const {balances, reload: reloadBalances} = useProgramBalances(merchantId, programList);

  // Fresh figures after awarding, creating a program or a purchase
  useFocusEffect(
    useCallback(() => {
      reloadBalances();
    }, [reloadBalances]),
  );

  const business = readMerchantProfile(profile);
  const refresh = () => {
    load(true);
    safeHaven.refresh();
    reloadBalances();
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={[styles.content, {paddingTop: insets.top + 12, paddingBottom: TAB_SCROLL_INSET}]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} tintColor={colors.link} />}>
        {/* Multiple businesses per login aren't supported yet, so no account switcher */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>{initials(business.name)}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.hi}>Hi {user?.first_name || 'there'}</Text>
            <Text style={styles.business} accessibilityRole="header">
              {business.name}
            </Text>
          </View>
        </View>

        {walletLoading && !wallet ? (
          <SkeletonCard height={120} />
        ) : !wallet && error ? (
          <RequestState error={error} onRetry={() => load(true)} />
        ) : (
          <BalanceCard label="Business wallet" amount={wallet?.available_balance ?? 0} currency={wallet?.currency}>
            {!safeHaven.loading && (
              <View style={styles.statusRow}>
                <View style={[styles.statusDot, safeHaven.error && styles.statusDotOff]} />
                <Text style={[styles.statusText, safeHaven.error && styles.statusTextOff]}>
                  {safeHaven.error ? 'Safe Haven account unavailable' : 'Safe Haven account active'}
                </Text>
              </View>
            )}
          </BalanceCard>
        )}

        <View style={styles.section}>
          <Text style={styles.prompt}>Quick actions</Text>
          <View style={styles.grid}>
            {ACTIONS.map(action => (
              <View key={action.id} style={styles.cell}>
                <ChoiceTile
                  role="button"
                  highlighted={action.primary}
                  label={action.label}
                  height={78}
                  icon={<Icon name={action.icon} size={20} color={action.primary ? colors.white : colors.text} />}
                  onPress={() => navigation.navigate(action.route)}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Programs
            </Text>
            <TouchableOpacity
              onPress={() => switchTab('Programs')}
              accessibilityRole="link"
              accessibilityLabel="Manage programs"
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Text style={styles.link}>Manage</Text>
            </TouchableOpacity>
          </View>
          {programsLoading && !programs ? (
            <SkeletonList rows={2} />
          ) : !programs && error ? (
            <RequestState error={error} onRetry={() => load(true)} />
          ) : programList.length === 0 ? (
            <EmptyState
              title="No open programs"
              hint="Create a program to start rewarding customers."
              action={{label: 'New program', onPress: () => navigation.navigate('CreateProgram')}}
            />
          ) : (
            programList.map(program => (
              <ProgramCard
                key={program.id}
                program={program}
                balance={balances[program.id]}
                compact
                onPress={() => navigation.navigate('ProgramDetails', {program})}
              />
            ))
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#2A2240',
    borderWidth: 1,
    borderColor: '#4A3C7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    ...type.bodyStrong,
    fontFamily: type.balance.fontFamily,
    color: '#D3CBFF',
  },
  headerText: {
    gap: 2,
  },
  hi: {
    ...type.caption,
    color: colors.textSecondary,
  },
  business: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.text,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: -8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  statusDotOff: {
    backgroundColor: colors.pending,
  },
  statusText: {
    ...type.captionStrong,
    color: '#7FF0C8',
  },
  statusTextOff: {
    color: '#F5D08A',
  },
  section: {
    gap: 10,
  },
  prompt: {
    ...type.bodyStrong,
    color: '#D9D9E3',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
  },
  cell: {
    width: '48.4%',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...type.sectionHeading,
    color: colors.text,
  },
  link: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
});

export default Overview;
