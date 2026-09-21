import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import ScreenBackground from '../../components/layout/ScreenBackground';
import { logout } from '../../actions/authActions';
import { theme } from '../../theme/colors';
import { spacing, radius } from '../../theme/spacing';

// ── Inline SVG icons ───────────────────────────────────────────────────────
const UserIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={8}
      r={4}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path
      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const IdCardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect
      x={2}
      y={5}
      width={20}
      height={14}
      rx={3}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Circle
      cx={8}
      cy={12}
      r={2.5}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.5}
    />
    <Path
      d="M13 10h5M13 14h3"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const CreditCardIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect
      x={2}
      y={5}
      width={20}
      height={14}
      rx={3}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path d="M2 10h20" stroke={theme.TEXT_TERTIARY} strokeWidth={1.8} />
    <Path
      d="M6 15h4"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const LockIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect
      x={5}
      y={11}
      width={14}
      height={10}
      rx={2}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path
      d="M8 11V7a4 4 0 018 0v4"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={16} r={1.5} fill={theme.TEXT_TERTIARY} />
  </Svg>
);

const BellOutlineIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 10a6 6 0 0112 0v4l2 2H4l2-2v-4z"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinejoin="round"
    />
    <Path
      d="M10 20a2 2 0 004 0"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
  </Svg>
);

const LanguageIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path
      d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
  </Svg>
);

const QuestionIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={10}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path
      d="M9.5 9a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 3"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={17} r={1} fill={theme.TEXT_TERTIARY} />
  </Svg>
);

const PhoneIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2a1 1 0 011.1-.2c1.2.5 2.5.8 4 .8a1 1 0 011 1V20a1 1 0 01-1 1C9.4 21 3 14.6 3 7a1 1 0 011-1h3.5a1 1 0 011 1c0 1.5.3 2.8.8 4a1 1 0 01-.2 1.1L6.6 10.8z"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const InfoIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Circle
      cx={12}
      cy={12}
      r={10}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path
      d="M12 11v6"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    <Circle cx={12} cy={7.5} r={1} fill={theme.TEXT_TERTIARY} />
  </Svg>
);

const DocIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
    <Rect
      x={4}
      y={2}
      width={16}
      height={20}
      rx={2}
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
    />
    <Path
      d="M8 8h8M8 12h8M8 16h5"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

const ChevronRight = () => (
  <Svg width={16} height={16} viewBox="0 0 16 16" fill="none">
    <Path
      d="M6 4l4 4-4 4"
      stroke={theme.TEXT_TERTIARY}
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const VerifiedBadge = () => (
  <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
    <Circle cx={11} cy={11} r={11} fill="#1D9BF0" />
    <Path
      d="M6.5 11l3 3 6-6"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const VaultaLogo = () => (
  <Svg width={28} height={28} viewBox="0 0 28 28" fill="none">
    <Path
      d="M14 3L4 8v6c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V8L14 3z"
      fill="#1D9BF0"
    />
    <Path
      d="M10 14l3 3 5-6"
      stroke="#fff"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────
const SettingRow = ({ icon, label, onPress, showDivider = true }) => (
  <>
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <ChevronRight />
    </TouchableOpacity>
    {showDivider && <View style={styles.rowDivider} />}
  </>
);

const SectionLabel = ({ label, light }) => (
  <Text style={[styles.sectionLabel, light && styles.sectionLabelLight]}>
    {label}
  </Text>
);

// ── Screen ─────────────────────────────────────────────────────────────────
const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = () => {
    dispatch(logout());
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScreenBackground>
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar + name */}
        <View style={styles.profileHeader}>
          <Image
            source={require('../../assets/images/profile_placeholder.jpg')}
            style={styles.avatar}
          />
          <View style={styles.nameRow}>
            <Text style={styles.name}>Ryan Cooper</Text>
            <VerifiedBadge />
          </View>
        </View>

        {/* Settings card */}
        <View style={styles.card}>
          {/* Account Setting */}
          <SectionLabel label="Account Setting" />
          <SettingRow
            icon={<UserIcon />}
            label="Personal Information"
            onPress={() => {}}
          />
          <SettingRow
            icon={<IdCardIcon />}
            label="Contac & Verification"
            onPress={() => {}}
            showDivider={false}
          />

          <View style={styles.sectionDivider} />

          {/* Payment */}
          <SectionLabel label="Payment" />
          <SettingRow
            icon={<CreditCardIcon />}
            label="Manage Cards & Banks"
            onPress={() => {}}
            showDivider={false}
          />

          <View style={styles.sectionDivider} />

          {/* Setting & Security */}
          <SectionLabel label="Setting & Security" />
          <SettingRow
            icon={<LockIcon />}
            label="Security & Privacy"
            onPress={() => {}}
          />
          <SettingRow
            icon={<BellOutlineIcon />}
            label="Notification Preference"
            onPress={() => {}}
            showDivider={false}
          />

          <View style={styles.sectionDivider} />

          {/* Other */}
          <SectionLabel label="Other" />
          <SettingRow
            icon={<LanguageIcon />}
            label="Language"
            onPress={() => {}}
            showDivider={false}
          />

          <View style={styles.sectionDivider} />

          {/* Help & Support */}
          <SectionLabel label="Help & Support" light />
          <SettingRow icon={<QuestionIcon />} label="FAQ" onPress={() => {}} />
          <SettingRow
            icon={<PhoneIcon />}
            label="Contac Us"
            onPress={() => {}}
          />
          <SettingRow
            icon={<InfoIcon />}
            label="Help Center"
            onPress={() => {}}
          />
          <SettingRow
            icon={<DocIcon />}
            label="Term Condition & Privacy Policy"
            onPress={() => {}}
            showDivider={false}
          />
        </View>

        {/* Action buttons */}
        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerVersion}>Ver 16.26.1</Text>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    paddingBottom: 110,
    paddingHorizontal: spacing.base,
  },

  // Profile header
  profileHeader: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: spacing.xl,
    gap: 12,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 22,
    color: theme.TEXT_WHITE,
  },

  // Settings card
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  sectionLabel: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_MUTED,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  sectionLabelLight: {
    color: theme.TEXT_PRIMARY,
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: 4,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 15,
    color: theme.TEXT_PRIMARY,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginLeft: 54,
  },

  // Buttons
  deleteBtn: {
    backgroundColor: '#8B1A1A',
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.WHITE,
  },
  logoutBtn: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 28,
  },
  logoutBtnText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.WHITE,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerName: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    letterSpacing: 2,
  },
  footerVersion: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 13,
    color: theme.TEXT_MUTED,
  },
});

export default Profile;
