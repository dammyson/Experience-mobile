// Helpers for displaying /merchant/{id}/activities entries.
// Each entry is either a POINTS activity (points moved for a customer) or a
// WALLET activity (money moved in/out of the merchant wallet).

export const formatMoney = (value, currency) => {
  const num = Number(value) || 0;
  const symbol = currency === 'NGN' ? '₦' : currency ? `${currency} ` : '';
  const [whole, fraction] = Math.abs(num).toFixed(2).split('.');
  return `${num < 0 ? '-' : ''}${symbol}${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}.${fraction}`;
};

// MERCHANT_AWARD -> Merchant Award
export const formatType = value =>
  value
    ? value
        .toLowerCase()
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

const isWallet = activity => activity.activity_type === 'WALLET';

// Positive for money/points coming in, negative for going out
const signedAmount = activity => {
  if (isWallet(activity)) {
    const amount = Number(activity.amount) || 0;
    return activity.direction === 'DEBIT' ? -amount : amount;
  }
  return Number(activity.points_delta) || 0;
};

export const getActivityTitle = activity =>
  isWallet(activity)
    ? activity.description || formatType(activity.type)
    : activity.customer_name || 'Customer';

export const getActivityAmount = activity => {
  const amount = signedAmount(activity);
  if (isWallet(activity)) {
    return `${amount > 0 ? '+' : ''}${formatMoney(amount, activity.currency)}`;
  }
  return `${amount > 0 ? '+' : ''}${amount} points`;
};

export const isActivityCredit = activity => signedAmount(activity) > 0;

// Shape expected by components/home/ActivitiesSection
export const mapMerchantActivityForHome = activity => ({
  id: activity.id,
  merchant: getActivityTitle(activity),
  points: getActivityAmount(activity),
  status: formatType(activity.type),
  isEarned: isActivityCredit(activity),
  epv: isWallet(activity)
    ? `Bal ${formatMoney(activity.balance_after, activity.currency)}`
    : activity.monetary_value != null
      ? `EPV ${formatMoney(activity.monetary_value, activity.currency)}`
      : '',
});
