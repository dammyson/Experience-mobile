// ============================================================
// Redesign tokens — source of truth: design/experience-design/README.md §1
// Dark theme only.
// ============================================================

export const colors = {
  // Backgrounds
  bg: '#0A0A0F',
  surface: '#15151C',
  surfaceRaised: '#1F1F29',
  tabBar: '#0F0F15',

  // Lines
  border: '#2E2E3A', // inputs, chips
  borderCard: '#24242E', // cards
  borderTile: '#2A2A35', // unselected tiles
  borderDashed: '#33333F', // empty states
  divider: '#1F1F29',
  headerBorder: 'rgba(255,255,255,0.08)',

  // Brand
  primary: '#6B4EF0',
  primaryBorder: '#8B74F7',
  primaryDisabled: '#2A2148',
  primaryDisabledText: '#9C93C9',
  link: '#B4A7FF',

  // Points / value
  points: '#C9BFFF',
  pointsBg: 'rgba(165,149,255,0.14)',

  // Status
  success: '#34D5A1',
  successText: '#5EE6B6',
  successBg: 'rgba(52,213,161,0.14)',
  pending: '#F5B740',
  pendingBg: 'rgba(245,183,64,0.14)',
  danger: '#F58E9B',
  dangerButton: '#C2334A',
  dangerBg: 'rgba(245,142,155,0.14)',

  // Text
  text: '#F4F4F7',
  textSecondary: '#B9B9C6',
  textMuted: '#9C9CAB',
  textOnBrand: '#E2DCFF', // labels on brandCard
  tabInactive: '#8A8A99',
  white: '#FFFFFF',

  // Misc
  overlay: 'rgba(0,0,0,0.6)',
  sheetHandle: '#3A3A48',
  skeleton: '#1F1F29',
};

// Gradients, in react-native-linear-gradient props
export const gradients = {
  // Top of every screen, absolute behind the header
  bgGlow: {
    colors: ['#3A1A8F', '#1C0F4A', '#0A0A0F'],
    locations: [0, 110 / 240, 1],
    height: 240,
  },
  // Balance cards, giveaway code
  brandCard: {
    colors: ['#7A5CFA', '#4B2BD1', '#2E1890'],
    locations: [0, 0.55, 1],
    start: {x: 0, y: 0},
    end: {x: 1, y: 1},
  },
};

export const fonts = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semiBold: 'DMSans-SemiBold',
  bold: 'DMSans-Bold',
};

const tabular = {fontVariant: ['tabular-nums']};

// Type roles from README §1. Caption is never below 11.
export const type = {
  balance: {fontFamily: fonts.bold, fontSize: 30, lineHeight: 36, letterSpacing: -0.6, ...tabular},
  statusTitle: {fontFamily: fonts.bold, fontSize: 19, lineHeight: 25},
  screenTitle: {fontFamily: fonts.semiBold, fontSize: 16, lineHeight: 22},
  tabTitle: {fontFamily: fonts.semiBold, fontSize: 18, lineHeight: 24},
  sectionHeading: {fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20},
  sectionHeadingSm: {fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18},
  body: {fontFamily: fonts.medium, fontSize: 13, lineHeight: 18},
  bodyStrong: {fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18},
  button: {fontFamily: fonts.semiBold, fontSize: 14, lineHeight: 20},
  input: {fontFamily: fonts.regular, fontSize: 14, lineHeight: 20},
  label: {fontFamily: fonts.regular, fontSize: 12, lineHeight: 16},
  caption: {fontFamily: fonts.regular, fontSize: 11, lineHeight: 15},
  captionStrong: {fontFamily: fonts.semiBold, fontSize: 11, lineHeight: 15},
  amount: {fontFamily: fonts.semiBold, fontSize: 13, lineHeight: 18, ...tabular},
  tabular,
};

export const radii = {
  sm: 10, // small buttons
  input: 12,
  cta: 14, // primary CTA, list cards
  card: 16, // tiles, cards
  balance: 20,
  sheet: 28,
  pill: 999,
};

// 4px grid
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
};

export const layout = {
  screenPadding: 20,
  touchTarget: 44,
  ctaHeight: 52,
  headerTopInset: 56,
  headerRow: 44,
  tabBarHeight: 86,
  // Bottom bar that pins the primary CTA: padding 16 / 20 / 36
  bottomBar: {paddingTop: 16, paddingHorizontal: 20, paddingBottom: 36},
};

export default {colors, gradients, fonts, type, radii, space, layout};
