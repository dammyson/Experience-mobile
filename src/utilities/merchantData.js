// Readers for merchant API responses. Programs, balances, activities and
// lookups follow what the existing screens used; giveaway, promo, verification
// and Safe Haven shapes aren't documented in the repo, so those readers accept
// the likely variants.

import {useSelector} from 'react-redux';
import {toList} from './customerData';
import {formatNaira, formatNumber, formatPts, formatActivityDate} from './format';
import {formatType, isActivityCredit} from './merchantActivity';
import {colors} from '../theme/tokens';

export const useMerchantId = () => useSelector(state => state.auth.user?.merchant_ids?.[0]);

const num = value => (value == null || value === '' ? null : Number(value));

// ── Programs ───────────────────────────────────────────────────────────────

export const readPrograms = data => toList(data, 'programs');

export const isPrepaid = program => String(program?.billing_type).toUpperCase() === 'PREPAID';

export const isOpen = program => {
  const status = String(program?.status || 'ACTIVE').toUpperCase();
  return !['CLOSED', 'SETTLED', 'ENDED'].includes(status);
};

// "1 pt per ₦1 · ₦0.50 per pt · up to 50% of a purchase"
export const programRule = program => {
  const earn = num(program?.points_per_currency_unit);
  const value = num(program?.point_value);
  const cap = num(program?.maximum_redemption_percentage);
  return [
    earn != null && `${formatNumber(earn)} pt${earn === 1 ? '' : 's'} per ₦1`,
    value != null && `${formatNaira(value)} per pt`,
    cap != null && (cap >= 100 ? 'pay in full' : `up to ${cap}% of a purchase`),
  ]
    .filter(Boolean)
    .join(' · ');
};

/**
 * Funding figures from GET …/programs/{id}/balance:
 * {funded, used, left, due, pct, settlement}
 */
export const readBalance = balance => {
  const funded = num(balance?.funding_amount);
  const used = num(balance?.funded_amount_used);
  const left = funded != null ? funded - (used || 0) : null;
  return {
    funded,
    used,
    left,
    due: num(balance?.amount_due),
    pointsAwarded: num(balance?.points_awarded ?? balance?.total_points_awarded),
    pct: funded ? Math.max(0, Math.min(1, left / funded)) : null,
    settlement: String(balance?.settlement_status || '').toUpperCase(),
  };
};

// Tag text + colours for a program card
export const programTag = (program, balance) => {
  const prepaid = isPrepaid(program);
  if (!isOpen(program)) {
    const b = readBalance(balance);
    const pending = (b.due ?? 0) > 0 || ['PENDING', 'UNPAID', 'PAYMENT_PENDING'].includes(b.settlement);
    return pending
      ? {label: 'Closed · payment pending', fg: colors.pending, bg: colors.pendingBg, frame: '#4A3A1C', pending}
      : {label: 'Closed', fg: colors.textSecondary, bg: colors.borderCard, frame: colors.borderCard, pending};
  }
  return prepaid
    ? {label: 'Prepaid', fg: colors.successText, bg: colors.successBg, frame: colors.borderCard}
    : {label: 'Postpaid · open', fg: colors.points, bg: 'rgba(165,149,255,0.16)', frame: colors.borderCard};
};

// ── Customers ──────────────────────────────────────────────────────────────

export const readLookupCustomer = data => {
  const customer = data?.customer ?? data;
  return customer?.id ? customer : null;
};

export const customerName = customer =>
  [customer?.first_name, customer?.last_name].filter(Boolean).join(' ').trim() || customer?.name || 'Customer';

export const maskEmail = email => {
  if (!email || !email.includes('@')) {
    return email || '';
  }
  const [local, domain] = email.split('@');
  return `${local.slice(0, Math.min(5, Math.max(1, local.length - 1)))}•••@${domain}`;
};

export const maskPhone = phone => {
  const digits = String(phone || '').replace(/\s/g, '');
  if (digits.length < 8) {
    return phone || '';
  }
  return `${digits.slice(0, digits.length - 7)} ••• ${digits.slice(-4)}`;
};

// A lookup failure that means "no match" rather than an outage
export const isNoMatch = error => /not found|no customer|does not exist|no match|404/i.test(error?.message ?? error ?? '');

export const IDENTIFIERS = [
  {id: 'email', label: 'Email', short: 'email', icon: 'mail', placeholder: 'name@example.com', keyboardType: 'email-address', lookupKey: 'email', awardKey: 'email'},
  {id: 'phone', label: 'Phone number', short: 'phone number', icon: 'phone', placeholder: '+234…', keyboardType: 'phone-pad', lookupKey: 'phoneNumber', awardKey: 'phone_number'},
  {id: 'customerId', label: 'Customer ID', short: 'customer ID', icon: 'idCard', placeholder: 'Arena customer ID', keyboardType: 'default', lookupKey: 'customerId', awardKey: 'customer_id'},
  {id: 'memberId', label: 'Your member ID', short: 'member ID', icon: 'ticket', placeholder: 'e.g. loyalty card no.', keyboardType: 'default', lookupKey: 'merchantCustomerId', awardKey: 'merchant_customer_id'},
];

// ── Activity ───────────────────────────────────────────────────────────────

const isReversal = activity => /REVERS/i.test(activity?.type || activity?.description || '');
const isAward = activity => activity?.activity_type !== 'WALLET' && /AWARD/i.test(activity?.type || '') && !isReversal(activity);

export const ledgerEntryId = activity => activity?.ledger_entry_id ?? activity?.ledger_id ?? null;

// Row props for ActivityRow (card variant)
export const activityRow = activity => {
  const wallet = activity.activity_type === 'WALLET';
  const credit = isActivityCredit(activity);
  const time = formatActivityDate(activity.created_at).replace(/^Today, /, '');
  if (wallet) {
    const amount = Number(activity.amount) || 0;
    return {
      icon: credit ? 'receive' : 'send',
      iconColor: credit ? colors.successText : '#D9D9E3',
      iconBg: credit ? colors.successBg : colors.borderCard,
      title: activity.description || formatType(activity.type) || 'Wallet',
      subtitle: [formatType(activity.type), time].filter(Boolean).join(' · '),
      amount: formatNaira(credit ? amount : -amount, {signed: true, currency: activity.currency}),
      amountColor: credit ? colors.successText : colors.text,
    };
  }
  const reversal = isReversal(activity);
  const name = activity.customer_name || 'Customer';
  return {
    icon: reversal ? 'reverse' : 'star',
    iconColor: reversal ? colors.danger : colors.points,
    iconBg: reversal ? colors.dangerBg : 'rgba(165,149,255,0.16)',
    title: `${reversal ? 'Reversal' : formatType(activity.type) || 'Points'} · ${name}`,
    subtitle: [activity.program_name, time].filter(Boolean).join(' · '),
    amount: formatPts(activity.points_delta, {signed: true}),
    amountColor: reversal || !credit ? colors.danger : colors.points,
    reversible: isAward(activity) && credit && !!ledgerEntryId(activity) && !!activity.program_id,
  };
};

// "Today" / "Yesterday" / "16 Oct"
export const dayLabel = value => {
  const label = formatActivityDate(value);
  return label.startsWith('Today') ? 'Today' : label || 'Earlier';
};

// ── Giveaways & promos ─────────────────────────────────────────────────────

export const readGiveaway = data => {
  const g = data?.giveaway ?? data ?? {};
  const maxClaims = num(g.max_claims ?? g.maximum_claims ?? g.limit);
  const claims = num(g.claims_count ?? g.claimed_count ?? g.total_claims ?? g.claims) ?? 0;
  const perClaim = num(g.points_per_claim ?? g.points);
  return {
    id: g.id ?? g.giveaway_id,
    name: g.name || g.title || 'Giveaway',
    code: g.code ?? g.giveaway_code ?? '',
    perClaim,
    maxClaims,
    claims,
    pointsGiven: num(g.points_given ?? g.total_points_given) ?? (perClaim != null ? perClaim * claims : null),
    spotsLeft: maxClaims != null ? Math.max(0, maxClaims - claims) : null,
    active: !['CLOSED', 'ENDED', 'INACTIVE', 'EXHAUSTED'].includes(String(g.status || 'ACTIVE').toUpperCase()),
    expiry: g.expires_at ?? null,
  };
};

export const readPromos = data => toList(data, 'promos');

// TODO: only ACTIVE is documented (README gap 7); INACTIVE is assumed for paused promos
export const PROMO_ACTIVE = 'ACTIVE';
export const PROMO_INACTIVE = 'INACTIVE';
export const isPromoActive = promo => String(promo?.status || PROMO_ACTIVE).toUpperCase() === PROMO_ACTIVE;

// ── Business ───────────────────────────────────────────────────────────────

export const readMerchantProfile = data => {
  const merchant = data?.merchant ?? data ?? {};
  const verification = merchant.verification ?? data?.verification ?? {};
  const status = String(
    verification.status ?? merchant.verification_status ?? merchant.kyb_status ?? '',
  ).toUpperCase();
  return {
    name: merchant.name || 'Your business',
    verified:
      merchant.is_verified === true ||
      merchant.verified === true ||
      ['VERIFIED', 'APPROVED', 'SUCCESS', 'COMPLETED'].includes(status),
    registrationNumber: verification.registration_number ?? merchant.registration_number ?? null,
    companyName: verification.company_name ?? merchant.company_name ?? null,
  };
};
