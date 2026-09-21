// ============================================================
// Arena Typography — extracted directly from Figma
// File: Unified Loyalty Network - UI/UX
// ============================================================

// Primary font: Plus Jakarta Sans (all brand headings, body, buttons)
// Secondary font: Inter (input labels, hint text)
export const fontFamily = {
  // Plus Jakarta Sans
  regular: 'PlusJakartaSans-Regular',
  medium: 'PlusJakartaSans-Medium',
  semiBold: 'PlusJakartaSans-SemiBold',
  bold: 'PlusJakartaSans-Bold',
  extraBold: 'PlusJakartaSans-ExtraBold',

  // Inter (used for input labels/hint text in Figma)
  interRegular: 'Inter-Regular',
  interMedium: 'Inter-Medium',
};

// From Figma text styles — exact values
export const textStyles = {
  // Display/Display sm/SemiBold — screen titles, success titles
  displaySm: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 24,
    lineHeight: 32,            // 1.333em × 24
  },
  // Display/Display xs/SemiBold — section labels
  displayXs: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 20,
    lineHeight: 26,            // 1.3em × 20
  },
  // Text/Text xl/Medium — body descriptions, alert messages
  textXl: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 18,
    lineHeight: 27,            // 1.5em × 18
  },
  // Text/Text lg/Medium — info rows, verification method labels
  textLg: {
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 16,
    lineHeight: 24,            // 1.5em × 16
  },
  // Text/Text lg/Bold — button labels
  textLgBold: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 24,
  },
  // Text sm/Medium — input field labels (Inter)
  textSm: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    lineHeight: 20,            // 1.428em × 14
  },
  // Text md/Regular — input placeholder/value text (Inter)
  textMd: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  // Label/l14/Medium — radio option labels
  label14: {
    fontFamily: 'SF Pro',      // fallback to system font
    fontSize: 14,
    lineHeight: 21,
  },
};

// Convenience size scale
export const fontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};
