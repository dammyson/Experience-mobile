// ============================================================
// Arena Design System — extracted directly from Figma
// File: Unified Loyalty Network - UI/UX
// ============================================================

export const darkTheme = {
  mode: 'dark',

  // ── Backgrounds ──────────────────────────────────────────
  BACKGROUND_COLOR: '#0B0B0E',       // Gray/gy000
  SURFACE_COLOR: '#13131A',
  SURFACE_ELEVATED: '#1A1A25',

  // ── Brand / Primary ──────────────────────────────────────
  PRIMARY_COLOR: '#9860F0',                        // Brand/br500 solid approx
  PRIMARY_DARK: '#5912C9',                         // Brand/br300 — glow blob
  PRIMARY_GLASS: 'rgba(152, 96, 240, 0.52)',       // Brand/br500 — button fill
  PRIMARY_SURFACE: 'rgba(242, 242, 242, 0.24)',    // secondary button fill (gray glass)
  BRAND_400: '#6715EA',                            // Brand/br400 — promo button
  BRAND_600: '#A777F3',                            // Brand/br600 — active tab
  BRAND_800: '#D1B9F9',                            // Brand/br800 — "See all" links

  // ── Text ─────────────────────────────────────────────────
  TEXT_PRIMARY: '#F2F2F2',           // Gray/gy900
  TEXT_SECONDARY: '#D9D9D9',         // Gray/gy800 — input labels
  TEXT_TERTIARY: '#A8A8A8',          // Gray/gy500 — placeholder / helper text
  TEXT_MUTED: '#6E6E6E',             // Gray/gy300 — very muted
  TEXT_WHITE: '#FFFFFF',             // White
  GRAY_700: '#CCCCCC',               // Gray/gy700
  GRAY_500: '#A8A8A8',               // Gray/gy500

  // ── Input ────────────────────────────────────────────────
  INPUT_BACKGROUND: 'rgba(255, 255, 255, 0.08)',
  INPUT_BORDER: 'rgba(255, 255, 255, 0.15)',
  INPUT_ACTIVE_BORDER: '#9860F0',
  INPUT_BORDER_RADIUS: 24,           // from Figma input borderRadius

  // ── Borders & Dividers ───────────────────────────────────
  BORDER_COLOR: '#6E6E6E',           // Gray/gy300
  BORDER_SUBTLE: 'rgba(255, 255, 255, 0.1)',
  DIVIDER_COLOR: 'rgba(255, 255, 255, 0.06)',

  // ── Status ───────────────────────────────────────────────
  SUCCESS_COLOR: '#20BB59',          // Success/sc300
  ERROR_COLOR: '#CA1111',            // Erorr/er300
  ERROR_BADGE: '#EB1414',            // Erorr/er400 — notification dot
  WARNING_COLOR: '#D4A207',          // Warning/wr300
  INFO_COLOR: '#3D8EF0',

  // ── Neutral ──────────────────────────────────────────────
  NEUTRAL_40: '#A8A8A8',             // Neutral/ne40

  // ── Misc ─────────────────────────────────────────────────
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  OVERLAY: 'rgba(0, 0, 0, 0.6)',
};

// Glow blob effect — replicate across screens
// position: absolute ellipse ~386x338, Brand/br300 fill, blur(136px), offset top-right
export const glowBlobStyle = {
  backgroundColor: darkTheme.PRIMARY_DARK,
  // blur approximated with shadowRadius in RN
  shadowColor: darkTheme.PRIMARY_DARK,
  shadowOffset: {width: 0, height: 0},
  shadowOpacity: 1,
  shadowRadius: 136,
  elevation: 0,
  opacity: 0.6,
};

export const theme = darkTheme;
