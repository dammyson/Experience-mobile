import React, {useEffect, useMemo, useRef, useState} from 'react';
import {View, Text, FlatList, RefreshControl, TouchableOpacity, StatusBar, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {showMessage} from 'react-native-flash-message';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {SearchInput, ChipGroup} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {
  toList,
  getMerchantId,
  getMerchantName,
  pointsByMerchant,
  favoriteIds,
  promosByMerchant,
  promoTitle,
  redemptionNote,
} from '../../utilities/customerData';
import {formatNumber, initials} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const FILTERS = [
  {id: 'all', label: 'All'},
  {id: 'fav', label: 'Favorites'},
  {id: 'pts', label: 'With points'},
  {id: 'promo', label: 'Promos'},
];

const HEART = '#FF7A9A';

const Pill = ({label, tone}) => (
  <View style={[styles.pill, styles[`pill_${tone}`]]}>
    <Text style={[styles.pillText, styles[`pillText_${tone}`]]}>{label}</Text>
  </View>
);

const MerchantCard = ({merchant, onToggleFavorite}) => (
  <View style={styles.card}>
    <View style={styles.cardTop}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{initials(merchant.name)}</Text>
      </View>
      <View style={styles.cardText}>
        <Text style={styles.cardName} numberOfLines={1}>
          {merchant.name}
        </Text>
        {!!merchant.category && (
          <Text style={styles.cardCategory} numberOfLines={1}>
            {merchant.category}
          </Text>
        )}
      </View>
      <TouchableOpacity
        onPress={onToggleFavorite}
        style={styles.heartBtn}
        accessibilityRole="button"
        accessibilityState={{selected: merchant.favorite}}
        accessibilityLabel={
          merchant.favorite ? `Remove ${merchant.name} from favorites` : `Add ${merchant.name} to favorites`
        }
        activeOpacity={0.7}>
        <Icon
          name="heart"
          size={19}
          color={merchant.favorite ? HEART : colors.tabInactive}
          fill={merchant.favorite ? HEART : 'none'}
        />
      </TouchableOpacity>
    </View>
    <View style={styles.pills}>
      <Pill label={`${formatNumber(merchant.points)} pts`} tone="points" />
      {!!merchant.promo && <Pill label={promoTitle(merchant.promo)} tone="promo" />}
      {!!merchant.redeem && <Pill label={merchant.redeem} tone="outline" />}
    </View>
  </View>
);

const Explore = () => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  const merchantsReq = useRequest(() => customerAPI.getMerchants(), []);
  const favoritesReq = useRequest(() => customerAPI.getFavoriteMerchants(), []);
  const pointsReq = useRequest(() => customerAPI.getPointsByMerchant(), []);
  const promosReq = useRequest(() => customerAPI.getPromos(), []);

  useEffect(() => {
    if (favoritesReq.data) {
      setFavorites(favoriteIds(favoritesReq.data));
    }
  }, [favoritesReq.data]);

  const balances = useMemo(() => pointsByMerchant(pointsReq.data), [pointsReq.data]);
  const promos = useMemo(() => promosByMerchant(promosReq.data), [promosReq.data]);
  const featured = useMemo(() => toList(promosReq.data, 'promos')[0], [promosReq.data]);

  const merchants = useMemo(
    () =>
      toList(merchantsReq.data, 'merchants').map(merchant => {
        const id = getMerchantId(merchant);
        const points = balances[id]?.points ?? 0;
        return {
          id,
          name: getMerchantName(merchant),
          category: merchant.category || merchant.description,
          points,
          favorite: favorites.has(id),
          promo: promos[id],
          redeem:
            redemptionNote(merchant) ||
            redemptionNote(balances[id]?.programs?.[0]) ||
            (points === 0 ? 'Not earning yet' : null),
        };
      }),
    [merchantsReq.data, balances, favorites, promos],
  );

  const shown = useMemo(() => {
    const query = search.trim().toLowerCase();
    return merchants.filter(m => {
      if (query && ![m.name, m.category].some(v => v?.toLowerCase().includes(query))) {
        return false;
      }
      return (
        filter === 'all' ||
        (filter === 'fav' && m.favorite) ||
        (filter === 'pts' && m.points > 0) ||
        (filter === 'promo' && !!m.promo)
      );
    });
  }, [merchants, filter, search]);

  // One favourite request per merchant at a time, so a double tap can't race
  const inFlight = useRef(new Set());

  const toggleFavorite = async merchant => {
    if (inFlight.current.has(merchant.id)) {
      return;
    }
    inFlight.current.add(merchant.id);
    const adding = !merchant.favorite;
    const update = add =>
      setFavorites(prev => {
        const next = new Set(prev);
        add ? next.add(merchant.id) : next.delete(merchant.id);
        return next;
      });

    update(adding);
    try {
      if (adding) {
        await customerAPI.addFavoriteMerchant(merchant.id);
      } else {
        await customerAPI.removeFavoriteMerchant(merchant.id);
      }
    } catch (err) {
      update(!adding);
      showMessage({message: err.message || "Couldn't update favorites", type: 'danger'});
    } finally {
      inFlight.current.delete(merchant.id);
    }
  };

  const refresh = () => {
    merchantsReq.refresh();
    favoritesReq.refresh();
    pointsReq.refresh();
    promosReq.refresh();
  };

  const header = (
    <View style={styles.headerContent}>
      <SearchInput value={search} onChangeText={setSearch} placeholder="Search merchants" />
      <ChipGroup options={FILTERS} value={filter} onChange={setFilter} accessibilityLabel="Filter merchants" />
      {!!featured && (
        <LinearGradient
          colors={['#2B1F5C', colors.surface]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.featured}
          accessible
          accessibilityLabel={`Promotion: ${promoTitle(featured)}`}>
          {featured.multiplier != null && (
            <Text style={styles.featuredMark} importantForAccessibility="no">
              {featured.multiplier}×
            </Text>
          )}
          <Text style={styles.featuredEyebrow}>Promotion</Text>
          <Text style={styles.featuredTitle}>{promoTitle(featured)}</Text>
          {!!(featured.description || featured.short_description) && (
            <Text style={styles.featuredSub} numberOfLines={2}>
              {featured.description || featured.short_description}
            </Text>
          )}
        </LinearGradient>
      )}
    </View>
  );

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Explore" root />
      <FlatList
        data={merchantsReq.loading || merchantsReq.error ? [] : shown}
        keyExtractor={item => String(item.id)}
        renderItem={({item}) => <MerchantCard merchant={item} onToggleFavorite={() => toggleFavorite(item)} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <RequestState
            loading={merchantsReq.loading}
            error={merchantsReq.error}
            onRetry={merchantsReq.reload}
            empty
            emptyText={search || filter !== 'all' ? 'No merchants match' : 'No merchants yet'}
            emptySubtext={search || filter !== 'all' ? 'Try another search or filter.' : 'Partner merchants will show up here.'}
          />
        }
        contentContainerStyle={[styles.list, {paddingBottom: TAB_SCROLL_INSET}]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={merchantsReq.refreshing} onRefresh={refresh} tintColor={colors.link} />
        }
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  list: {
    paddingTop: 18,
    paddingHorizontal: layout.screenPadding,
    gap: 10,
  },
  headerContent: {
    gap: 16,
    marginBottom: 6,
  },
  featured: {
    overflow: 'hidden',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#3A2E6E',
    padding: 16,
    gap: 6,
  },
  featuredMark: {
    position: 'absolute',
    right: -10,
    top: -14,
    fontFamily: type.balance.fontFamily,
    fontSize: 86,
    letterSpacing: -3.4,
    color: 'rgba(165,149,255,0.14)',
  },
  featuredEyebrow: {
    ...type.captionStrong,
    fontFamily: type.balance.fontFamily,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: colors.link,
  },
  featuredTitle: {
    fontFamily: type.balance.fontFamily,
    fontSize: 16,
    color: colors.text,
  },
  featuredSub: {
    ...type.caption,
    color: colors.textSecondary,
  },
  card: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: 14,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: colors.borderCard,
    borderWidth: 1,
    borderColor: colors.borderDashed,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    ...type.bodyStrong,
    fontFamily: type.balance.fontFamily,
    color: colors.text,
  },
  cardText: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    ...type.sectionHeading,
    color: colors.text,
  },
  cardCategory: {
    ...type.caption,
    color: colors.textMuted,
  },
  heartBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  pill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.pill,
  },
  pill_points: {
    backgroundColor: colors.pointsBg,
  },
  pill_promo: {
    backgroundColor: colors.successBg,
  },
  pill_outline: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  pillText: {
    ...type.captionStrong,
    ...type.tabular,
  },
  pillText_points: {
    color: colors.points,
  },
  pillText_promo: {
    color: colors.successText,
  },
  pillText_outline: {
    color: colors.textSecondary,
  },
});

export default Explore;
