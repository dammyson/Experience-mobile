import React, {useEffect} from 'react';
import {View, Text, ScrollView, RefreshControl, StatusBar, TouchableOpacity, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import ScreenHeader from '../../components/layout/ScreenHeader';
import Icon from '../../components/icons/Icon';
import {useTabContext} from '../../navigations/TabContext';
import {getProfile, logout} from '../../actions/authActions';
import {customerAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {toList, isIdentityVerified} from '../../utilities/customerData';
import {initials} from '../../utilities/format';
import {TAB_SCROLL_INSET} from '../../utilities/platform';
import {colors, type, radii, layout} from '../../theme/tokens';

const SettingsGroup = ({title, rows}) => (
  <View style={styles.group}>
    <Text style={styles.groupTitle} accessibilityRole="header">
      {title}
    </Text>
    <View style={styles.groupCard}>
      {rows.map((row, i) => {
        const Container = row.onPress ? TouchableOpacity : View;
        return (
          <Container
            key={row.label}
            onPress={row.onPress}
            activeOpacity={0.7}
            accessibilityRole={row.onPress ? 'button' : undefined}
            accessible
            accessibilityLabel={[row.label, row.value].filter(Boolean).join(', ')}
            style={[styles.row, i > 0 && styles.rowBorder]}>
            <View style={styles.rowIcon}>
              <Icon name={row.icon} size={16} color={colors.textSecondary} />
            </View>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {!!row.value && <Text style={styles.rowValue}>{row.value}</Text>}
            {!!row.onPress && <Icon name="chevronRight" size={16} color={colors.textMuted} />}
          </Container>
        );
      })}
    </View>
  </View>
);

const CustomerProfile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {switchTab} = useTabContext();
  const {user, profile, verifications, bankAccounts, profileLoading} = useSelector(state => state.auth);
  const favorites = useRequest(() => customerAPI.getFavoriteMerchants(), []);

  useEffect(() => {
    dispatch(getProfile()).catch(() => {});
  }, [dispatch]);

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Your account';
  const email = user?.email || profile?.email;
  const phone = user?.phone_number || profile?.phone_number;
  const verified = isIdentityVerified(verifications);
  const bank = bankAccounts?.[0];
  const favoriteCount = favorites.data ? String(toList(favorites.data, 'merchants', 'favorites').length) : undefined;

  const handleSignOut = async () => {
    await dispatch(logout());
    navigation.reset({index: 0, routes: [{name: 'Login'}]});
  };

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ScreenHeader title="Profile" root />
      <ScrollView
        contentContainerStyle={[styles.content, {paddingBottom: TAB_SCROLL_INSET}]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={profileLoading}
            onRefresh={() => {
              dispatch(getProfile(true)).catch(() => {});
              favorites.refresh();
            }}
            tintColor={colors.link}
          />
        }>
        <View
          style={styles.account}
          accessible
          accessibilityLabel={[fullName, email, phone].filter(Boolean).join(', ')}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials(fullName)}</Text>
          </View>
          <View style={styles.accountText}>
            <Text style={styles.name}>{fullName}</Text>
            {!!email && <Text style={styles.meta}>{email}</Text>}
            {!!phone && <Text style={styles.meta}>{phone}</Text>}
          </View>
        </View>

        {/* {!verified && (
          <TouchableOpacity
            onPress={() => navigation.navigate('VerifyIdentity')}
            accessibilityRole="button"
            accessibilityLabel="Verify your identity. Unlock bank transfers, takes about 2 minutes."
            activeOpacity={0.85}
            style={styles.verify}>
            <View style={styles.verifyIcon}>
              <Icon name="shield" size={22} color={colors.pending} />
            </View>
            <View style={styles.verifyText}>
              <Text style={styles.verifyTitle}>Verify your identity</Text>
              <Text style={styles.verifySub}>Unlock bank transfers · takes about 2 minutes</Text>
            </View>
            <Icon name="chevronRight" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )} */}

        {/* README gap 2: profile is read-only, so no edit screen */}
        <SettingsGroup
          title="Account"
          rows={[
            {label: 'Personal details', value: 'View only', icon: 'profile'},
            // {
            //   label: 'Bank account',
            //   value: bank?.bank_name || 'Safe Haven',
            //   icon: 'bank',
            //   onPress: () => switchTab('Wallet'),
            // },
            {
              label: 'Favorite merchants',
              value: favoriteCount,
              icon: 'heart',
              onPress: () => switchTab('Explore'),
            },
          ]}
        />

        {/* No change-password endpoint while signed in; the reset flow is the fallback */}
        <SettingsGroup
          title="Security"
          rows={[
            {
              label: 'Reset password',
              value: 'By email code',
              icon: 'lock',
              onPress: () => navigation.navigate('ForgotPassword', {email}),
            },
          ]}
        />

        <TouchableOpacity style={styles.signOut} onPress={handleSignOut} accessibilityRole="button" activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    paddingHorizontal: layout.screenPadding,
    gap: 18,
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2240',
    borderWidth: 1,
    borderColor: '#4A3C7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: type.balance.fontFamily,
    fontSize: 18,
    color: '#D3CBFF',
  },
  accountText: {
    gap: 2,
    flexShrink: 1,
  },
  name: {
    fontFamily: type.balance.fontFamily,
    fontSize: 16,
    color: colors.text,
  },
  meta: {
    ...type.caption,
    color: colors.textMuted,
  },
  verify: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: radii.card,
    borderWidth: 1,
    borderColor: '#3A2E6E',
    backgroundColor: '#2B1F5C',
  },
  verifyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.pendingBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyText: {
    flex: 1,
    gap: 2,
  },
  verifyTitle: {
    ...type.bodyStrong,
    color: colors.text,
  },
  verifySub: {
    ...type.caption,
    color: colors.textSecondary,
  },
  group: {
    gap: 8,
  },
  groupTitle: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.textSecondary,
  },
  groupCard: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 14,
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    ...type.bodyStrong,
    flex: 1,
    color: colors.text,
  },
  rowValue: {
    ...type.caption,
    color: colors.textMuted,
  },
  signOut: {
    height: 50,
    borderRadius: radii.cta,
    borderWidth: 1,
    borderColor: '#4A2530',
    backgroundColor: 'rgba(245,142,155,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    ...type.bodyStrong,
    color: colors.danger,
  },
});

export default CustomerProfile;
