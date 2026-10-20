// ============================================================
// Arena legacy theme keys.
// New code should import from ./tokens. These keys are mapped onto the
// redesign tokens so screens that haven't been rebuilt yet already use the
// new palette.
// ============================================================

import {colors} from './tokens';

export const darkTheme = {
  mode: 'dark',

  // ── Backgrounds ──────────────────────────────────────────
  BACKGROUND_COLOR: colors.bg,
  SURFACE_COLOR: colors.surface,
  SURFACE_ELEVATED: colors.surfaceRaised,

  // ── Brand / Primary ──────────────────────────────────────
  PRIMARY_COLOR: colors.primary,
  PRIMARY_DARK: '#3A1A8F',          // top of bgGlow
  PRIMARY_GLASS: colors.primary,    // was a translucent button fill
  PRIMARY_SURFACE: colors.surfaceRaised, // secondary button fill
  BRAND_400: colors.primary,
  BRAND_600: colors.link,           // active tab
  BRAND_800: colors.link,           // "See all" links

  // ── Text ─────────────────────────────────────────────────
  TEXT_PRIMARY: colors.text,
  TEXT_SECONDARY: colors.textSecondary,
  TEXT_TERTIARY: colors.textMuted,
  TEXT_MUTED: colors.textMuted,
  TEXT_WHITE: colors.white,
  GRAY_700: colors.textSecondary,
  GRAY_500: colors.textMuted,

  // ── Input ────────────────────────────────────────────────
  INPUT_BACKGROUND: colors.surface,
  INPUT_BORDER: colors.border,
  INPUT_ACTIVE_BORDER: colors.primary,
  INPUT_BORDER_RADIUS: 12,

  // ── Borders & Dividers ───────────────────────────────────
  BORDER_COLOR: colors.border,
  BORDER_SUBTLE: colors.borderCard,
  DIVIDER_COLOR: colors.divider,

  // ── Status ───────────────────────────────────────────────
  SUCCESS_COLOR: colors.success,
  ERROR_COLOR: colors.danger,
  ERROR_BADGE: colors.dangerButton,
  WARNING_COLOR: colors.pending,
  INFO_COLOR: colors.link,

  // ── Neutral ──────────────────────────────────────────────
  NEUTRAL_40: colors.textMuted,

  // ── Misc ─────────────────────────────────────────────────
  WHITE: colors.white,
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  OVERLAY: colors.overlay,
};

export const theme = darkTheme;
