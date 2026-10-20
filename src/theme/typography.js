// ============================================================
// Arena legacy typography.
// New code should use `type` / `fonts` from ./tokens. The legacy names below
// point at DM Sans so older screens render in the redesign font.
// ============================================================

import {fonts} from './tokens';

export const fontFamily = {
  regular: fonts.regular,
  medium: fonts.medium,
  semiBold: fonts.semiBold,
  bold: fonts.bold,
  extraBold: fonts.bold,

  // Previously Inter
  interRegular: fonts.regular,
  interMedium: fonts.medium,
};

export const textStyles = {
  // Screen titles, success titles
  displaySm: {fontFamily: fonts.semiBold, fontSize: 24, lineHeight: 32},
  // Section labels
  displayXs: {fontFamily: fonts.semiBold, fontSize: 20, lineHeight: 26},
  // Body descriptions, alert messages
  textXl: {fontFamily: fonts.medium, fontSize: 18, lineHeight: 27},
  // Info rows
  textLg: {fontFamily: fonts.medium, fontSize: 16, lineHeight: 24},
  // Button labels
  textLgBold: {fontFamily: fonts.bold, fontSize: 16, lineHeight: 24},
  // Input field labels
  textSm: {fontFamily: fonts.medium, fontSize: 14, lineHeight: 20},
  // Input values
  textMd: {fontFamily: fonts.regular, fontSize: 16, lineHeight: 24},
  // Radio option labels
  label14: {fontFamily: fonts.regular, fontSize: 14, lineHeight: 21},
};

export const fontSize = {
  xs: 11, // captions never go below 11
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
};
