// Display rules for amounts (design/experience-design/README.md, "Points vs money"):
//   points  → lavender, "pts" suffix:        4,200 pts
//   money   → white, ₦ prefix, 2 decimals:   ₦184,250.00
//   value   → mint, "≈", whole naira:        ≈ ₦2,100

import dayjs from 'dayjs';
import {formatMoney} from './merchantActivity';

const MINUS = '−';

const toNumber = value => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const sign = (num, signed) => (num < 0 ? MINUS : signed && num > 0 ? '+' : '');

export const formatNumber = value =>
  Math.round(Math.abs(toNumber(value))).toLocaleString('en-US');

// formatPts(4200) → "4,200 pts"; formatPts(120, {signed: true}) → "+120 pts"
export const formatPts = (value, {signed = false} = {}) => {
  const num = toNumber(value);
  return `${sign(num, signed)}${formatNumber(num)} pts`;
};

// formatNaira(184250) → "₦184,250.00"; formatNaira(-25000) → "−₦25,000.00"
export const formatNaira = (value, {signed = false, currency = 'NGN'} = {}) => {
  const num = toNumber(value);
  return `${sign(num, signed)}${formatMoney(Math.abs(num), currency)}`;
};

// formatEstimate(2100) → "≈ ₦2,100"
export const formatEstimate = (value, {currency = 'NGN'} = {}) => {
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  return `≈ ${symbol}${formatNumber(value)}`;
};

// "Ada Okafor" → "AO"
export const initials = name =>
  (name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');

// Local Nigerian number typed after a fixed +234 prefix → "+2348030000000".
// Accepts "0803…", "803…" or a pasted "+234803…".
export const toNigerianPhone = input => {
  const digits = (input || '').replace(/\D/g, '').replace(/^234/, '').replace(/^0/, '');
  return digits ? `+234${digits}` : '';
};

// Valid when 10 digits follow +234
export const isNigerianPhone = input => /^\+234\d{10}$/.test(toNigerianPhone(input));

// "Today, 09:14" · "Yesterday" · "16 Oct"
export const formatActivityDate = value => {
  if (!value) {
    return '';
  }
  const date = dayjs(value);
  if (!date.isValid()) {
    return '';
  }
  const today = dayjs();
  if (date.isSame(today, 'day')) {
    return `Today, ${date.format('HH:mm')}`;
  }
  if (date.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }
  return date.format(date.isSame(today, 'year') ? 'D MMM' : 'D MMM YYYY');
};

// "Good morning" / "Good afternoon" / "Good evening"
export const greeting = (hour = new Date().getHours()) =>
  hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
