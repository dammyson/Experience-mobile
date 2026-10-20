import React, {useCallback, useEffect, useMemo} from 'react';
import {View, Text, Image, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ScreenBackground from '../../components/layout/ScreenBackground';
import RequestState from '../../components/layout/RequestState';
import {
  BalanceCard,
  ChoiceTile,
  ActivityRow,
  EmptyState,
  SkeletonCard,
  SkeletonList,
} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {useTabContext} from '../../navigations/TabContext';
import {getDashboard} from '../../actions/customerActions';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import useWalletAccount from '../../utilities/useWalletAccount';
import {toList, getMerchantId, getMerchantName, pointsByMerchant} from '../../utilities/customerData';
import {formatNaira, formatNumber, formatPts, formatActivityDate, greeting, initials} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const SectionHeader = ({title, onSeeAll}) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle} accessibilityRole="header">
      {title}
    </Text>
    {!!onSeeAll && (
      <TouchableOpacity
        onPress={onSeeAll}
        accessibilityRole="link"
        accessibilityLabel={`See all ${title.toLowerCase()}`}
        hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
        <Text style={styles.seeAll}>See all</Text>
      </TouchableOpacity>
    )}
  </View>
);

const CustomerHome = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const {switchTab} = useTabContext();
  const {user} = useSelector(state => state.auth);
  const {dashboard, dashboardLoading, error: dashboardError} = useSelector(state => state.customer);
  // Without cached data a failed dashboard would read as a real zero balance
  const dashboardFailed = !dashboard && !dashboardLoading && !!dashboardError;

  const points = useRequest(() => customerAPI.getPointsByMerchant(), []);
  const favorites = useRequest(() => customerAPI.getFavoriteMerchants(), []);
  const wallet = useWalletAccount();

  useEffect(() => {
    dispatch(getDashboard()).catch(() => {});
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(getDashboard(true)).catch(() => {});
    points.refresh();
    favorites.refresh();
    wallet.refresh();
  }, [dispatch, points, favorites, wallet]);

  const balances = useMemo(() => pointsByMerchant(points.data), [points.data]);
  const merchantCount = points.data?.merchant_count ?? Object.keys(balances).length;
  const totalPoints = dashboard?.wallet_summary?.total_points ?? points.data?.total_points ?? 0;
  const favoriteList = toList(favorites.data, 'merchants', 'favorites').slice(0, 4);
  const recent = (dashboard?.recent_activity || []).slice(0, 3);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'there';

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {paddingTop: insets.top + 12, paddingBottom: TAB_SCROLL_INSET},
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={dashboardLoading && !!dashboard}
            onRefresh={handleRefresh}
            tintColor={colors.link}
          />
        }>
        {/* Greeting — no notifications endpoint yet, so no bell (README gap 6) */}
        <View style={styles.greetingRow}>
          <View style={styles.avatar} accessible={false}>
            <Text style={styles.avatarText}>{initials(fullName)}</Text>
          </View>
          <View style={styles.greetingText}>
            <Text style={styles.greeting}>{greeting()}</Text>
            <Text style={styles.name} accessibilityRole="header">
              {fullName}
            </Text>
          </View>
        </View>

        {dashboardLoading && !dashboard ? (
          <SkeletonCard height={190} />
        ) : dashboardFailed ? (
          <RequestState error={dashboardError} onRetry={() => dispatch(getDashboard(true)).catch(() => {})} />
        ) : (
          <BalanceCard
            label="Total loyalty points"
            amount={totalPoints}
            kind="points"
            caption={`across ${merchantCount} merchant${merchantCount === 1 ? '' : 's'}`}
            right={
              <Image
                source={require('../../assets/images/arena_logo.png')}
                style={styles.cardLogo}
                resizeMode="contain"
                accessibilityIgnoresInvertColors
              />
            }>
            <TouchableOpacity
              style={styles.walletRow}
              onPress={() => switchTab('Wallet')}
              accessibilityRole="button"
              accessibilityLabel={
                wallet.account.balance != null
                  ? `Wallet balance ${formatNaira(wallet.account.balance)}`
                  : 'Set up your wallet'
              }
              activeOpacity={0.8}>
              <View style={styles.walletText}>
                <Text style={styles.walletLabel}>
                  {wallet.account.exists ? 'Wallet balance' : 'Wallet'}
                </Text>
                <Text style={styles.walletValue}>
                  {wallet.loading
                    ? '—'
                    : wallet.account.balance != null
                      ? formatNaira(wallet.account.balance, {currency: wallet.account.currency})
                      : 'Set up your wallet'}
                </Text>
              </View>
              <Icon name="chevronRight" size={20} color={colors.textOnBrand} />
            </TouchableOpacity>
          </BalanceCard>
        )}

        <View style={styles.section}>
          <Text style={styles.prompt}>What would you like to do?</Text>
          <View style={styles.tiles}>
            <View style={styles.tile}>
              <ChoiceTile
                role="button"
                highlighted
                label="Pay with points"
                height={92}
                icon={<Icon name="card" size={22} color={colors.white} />}
                onPress={() => navigation.navigate('SelectPurchase')}
              />
            </View>
            <View style={styles.tile}>
              <ChoiceTile
                role="button"
                label="Send points"
                height={92}
                icon={<Icon name="send" size={22} color={colors.text} />}
                onPress={() => navigation.navigate('SendPoints')}
              />
            </View>
            <View style={styles.tile}>
              <ChoiceTile
                role="button"
                label="Explore"
                height={92}
                icon={<Icon name="business" size={22} color={colors.text} />}
                onPress={() => switchTab('Explore')}
              />
            </View>
          </View>
        </View>

        {!favorites.error && (
          <View style={styles.section}>
            <SectionHeader title="Favorite merchants" onSeeAll={() => switchTab('Explore')} />
            {favorites.loading ? (
              <SkeletonList rows={1} />
            ) : favoriteList.length === 0 ? (
              <EmptyState title="No favourites yet" hint="Tap the heart on a merchant in Explore." />
            ) : (
              <View style={styles.favorites}>
                {favoriteList.map(merchant => {
                  const id = getMerchantId(merchant);
                  const name = getMerchantName(merchant);
                  const pts = balances[id]?.points ?? merchant.points ?? 0;
                  return (
                    <View
                      key={id}
                      style={styles.favorite}
                      accessible
                      accessibilityLabel={`${name}, ${formatPts(pts)}`}>
                      <View style={styles.favoriteBadge}>
                        <Text style={styles.favoriteInitials}>{initials(name)}</Text>
                      </View>
                      <Text style={styles.favoriteName} numberOfLines={1}>
                        {name}
                      </Text>
                      <Text style={styles.favoritePts}>{formatNumber(pts)} pts</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View>
          <SectionHeader title="Recent activity" onSeeAll={() => switchTab('Wallet')} />
          {dashboardLoading && !dashboard ? (
            <SkeletonList rows={3} />
          ) : dashboardFailed ? null : recent.length === 0 ? (
            <EmptyState title="No activity yet" hint="Earn points at any partner merchant to get started." />
          ) : (
            recent.map(item => {
              const delta = Number(item.points_delta) || 0;
              const earned = delta > 0;
              const name = item.merchant_name || 'Transaction';
              return (
                <ActivityRow
                  key={item.id}
                  variant="list"
                  initials={initials(name)}
                  title={name}
                  subtitle={[earned ? 'Points earned' : 'Paid with points', formatActivityDate(item.created_at)]
                    .filter(Boolean)
                    .join(' · ')}
                  amount={formatPts(delta, {signed: true})}
                  amountColor={earned ? colors.points : colors.text}
                />
              );
            })
          )}
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.screenPadding,
    gap: 22,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#2A2240',
    borderWidth: 1,
    borderColor: '#4A3C7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...type.bodyStrong,
    color: '#D3CBFF',
  },
  greetingText: {
    gap: 2,
  },
  greeting: {
    ...type.caption,
    color: colors.textSecondary,
  },
  name: {
    fontFamily: type.bodyStrong.fontFamily,
    fontSize: 15,
    color: colors.text,
  },
  cardLogo: {
    width: 24,
    height: 30,
  },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.cta,
    backgroundColor: 'rgba(10,10,15,0.35)',
  },
  walletText: {
    gap: 2,
  },
  walletLabel: {
    ...type.caption,
    color: colors.textOnBrand,
  },
  walletValue: {
    ...type.amount,
    fontSize: 16,
    lineHeight: 22,
    color: colors.white,
  },
  section: {
    gap: 10,
  },
  prompt: {
    ...type.bodyStrong,
    color: '#D9D9E3',
    textAlign: 'center',
  },
  tiles: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  sectionTitle: {
    ...type.sectionHeading,
    color: colors.text,
  },
  seeAll: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
  favorites: {
    flexDirection: 'row',
    gap: 10,
  },
  favorite: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: radii.card,
    backgroundColor: '#17171F',
    borderWidth: 1,
    borderColor: colors.borderTile,
  },
  favoriteBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.borderCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteInitials: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.text,
  },
  favoriteName: {
    ...type.captionStrong,
    color: '#D9D9E3',
  },
  favoritePts: {
    ...type.captionStrong,
    ...type.tabular,
    color: colors.points,
  },
});

export default CustomerHome;
