import React, {useCallback, useRef, useState} from 'react';
import {View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import RequestState from '../../components/layout/RequestState';
import {ChoiceTile, ConfirmSheet, EmptyState, SkeletonList} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {useMerchantId, readPromos, isPromoActive, PROMO_ACTIVE, PROMO_INACTIVE} from '../../utilities/merchantData';
import {getLocalGiveaways} from '../../utilities/localGiveaways';
import {colors, type, radii, layout} from '../../theme/tokens';

const SmallButton = ({label, onPress, accessibilityLabel, children}) => (
  <TouchableOpacity
    style={styles.smallBtn}
    onPress={onPress}
    hitSlop={{top: 6, bottom: 6}}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel || label}
    activeOpacity={0.8}>
    {children ?? <Text style={styles.smallText}>{label}</Text>}
  </TouchableOpacity>
);

const Promotions = () => {
  const navigation = useNavigation();
  const merchantId = useMerchantId();
  const promosReq = useRequest(() => merchantAPI.getPromos(merchantId), [merchantId]);
  const [giveaways, setGiveaways] = useState([]);
  const [deleting, setDeleting] = useState(null);

  // Reload after creating / editing on the next screens
  const hasFocused = useRef(false);
  const {reload} = promosReq;
  useFocusEffect(
    useCallback(() => {
      getLocalGiveaways(merchantId).then(setGiveaways);
      if (hasFocused.current) {
        reload();
      }
      hasFocused.current = true;
    }, [merchantId, reload]),
  );

  const promos = readPromos(promosReq.data);

  // One status change per promo at a time
  const toggling = useRef(new Set());

  const toggle = async promo => {
    if (toggling.current.has(promo.id)) {
      return;
    }
    toggling.current.add(promo.id);
    const next = isPromoActive(promo) ? PROMO_INACTIVE : PROMO_ACTIVE;
    try {
      await merchantAPI.updatePromo(merchantId, promo.id, {status: next});
      showMessage({message: next === PROMO_ACTIVE ? 'Promotion activated' : 'Promotion paused', type: 'success'});
      reload();
    } catch (err) {
      showMessage({message: err.message || "The promotion couldn't be updated.", type: 'danger'});
    } finally {
      toggling.current.delete(promo.id);
    }
  };

  const confirmDelete = async () => {
    try {
      await merchantAPI.deletePromo(merchantId, deleting.id);
      setDeleting(null);
      showMessage({message: 'Promotion deleted', type: 'success'});
      reload();
    } catch (err) {
      setDeleting(null);
      showMessage({message: err.message || "The promotion couldn't be deleted.", type: 'danger'});
    }
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Campaigns" onBack={() => navigation.goBack()} />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={promosReq.refreshing} onRefresh={promosReq.refresh} tintColor={colors.link} />}>
        <View style={styles.actions}>
          <View style={styles.action}>
            <ChoiceTile
              role="button"
              highlighted
              label="New promotion"
              height={72}
              icon={<Icon name="plus" size={20} color={colors.white} />}
              onPress={() => navigation.navigate('PromoForm')}
            />
          </View>
          <View style={styles.action}>
            <ChoiceTile
              role="button"
              label="New giveaway"
              height={72}
              icon={<Icon name="ticket" size={20} color={colors.text} />}
              onPress={() => navigation.navigate('CreateGiveaway')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Promotions
          </Text>
          {promosReq.loading ? (
            <SkeletonList rows={3} />
          ) : promosReq.error ? (
            <RequestState error={promosReq.error} onRetry={reload} />
          ) : promos.length === 0 ? (
            <EmptyState title="No promotions yet" hint="Promotions show on Explore for your customers." />
          ) : (
            promos.map(promo => {
              const active = isPromoActive(promo);
              return (
                <View key={promo.id} style={styles.promo}>
                  <View style={styles.promoTop}>
                    <View style={styles.promoText}>
                      <Text style={styles.promoTitle}>{promo.title || promo.name || 'Promotion'}</Text>
                      {!!promo.description && (
                        <Text style={styles.promoDesc} numberOfLines={2}>
                          {promo.description}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.status, active ? styles.statusOn : styles.statusOff]}>
                      <Text style={[styles.statusText, {color: active ? colors.successText : colors.textSecondary}]}>
                        {active ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.promoActions}>
                    <SmallButton label="Edit" onPress={() => navigation.navigate('PromoForm', {promo})} />
                    <SmallButton label={active ? 'Pause' : 'Activate'} onPress={() => toggle(promo)} />
                    <SmallButton accessibilityLabel={`Delete ${promo.title || 'promotion'}`} onPress={() => setDeleting(promo)}>
                      <Icon name="trash" size={16} color={colors.danger} />
                    </SmallButton>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle} accessibilityRole="header">
            Giveaways
          </Text>
          {/* README gap 5: no list endpoint, so only giveaways created on this device are shown */}
          {giveaways.length === 0 ? (
            <EmptyState title="No giveaways on this device" hint="Giveaways you create here show up in this list." />
          ) : (
            giveaways.map(g => (
              <TouchableOpacity
                key={g.id}
                style={styles.giveaway}
                onPress={() => navigation.navigate('Giveaway', {giveawayId: g.id, name: g.name})}
                accessibilityRole="button"
                activeOpacity={0.8}>
                <Icon name="ticket" size={18} color={colors.points} />
                <View style={styles.promoText}>
                  <Text style={styles.promoTitle}>{g.name}</Text>
                  {!!g.code && <Text style={styles.promoDesc}>{g.code}</Text>}
                </View>
                <Icon name="chevronRight" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))
          )}
          {giveaways.length > 0 && (
            <Text style={styles.footnote}>Only giveaways created on this device are listed.</Text>
          )}
        </View>
      </ScrollView>

      <ConfirmSheet
        visible={!!deleting}
        title={`Delete ${deleting?.title || 'promotion'}?`}
        note="Customers will no longer see it on Explore. This can't be undone."
        editLabel="Cancel"
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
        onClose={() => setDeleting(null)}
      />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 18,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 40,
    gap: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  action: {
    flex: 1,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    ...type.sectionHeading,
    color: colors.text,
  },
  promo: {
    padding: 14,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    gap: 12,
  },
  promoTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  promoText: {
    flex: 1,
    gap: 2,
  },
  promoTitle: {
    ...type.bodyStrong,
    color: colors.text,
  },
  promoDesc: {
    ...type.caption,
    color: colors.textMuted,
  },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },
  statusOn: {
    backgroundColor: colors.successBg,
  },
  statusOff: {
    backgroundColor: colors.borderCard,
  },
  statusText: {
    ...type.captionStrong,
  },
  promoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  smallBtn: {
    height: 34,
    minWidth: 44,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallText: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.text,
  },
  giveaway: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  footnote: {
    ...type.caption,
    color: colors.textMuted,
  },
});

export default Promotions;
