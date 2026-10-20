// Readers for customer API responses.
// Shapes for /customer/points/merchants and /customer/merchants follow what the
// existing screens use. The favorites, promos, wallet and Safe Haven balance
// responses aren't documented yet, so these readers accept the likely variants
// (a bare list or a wrapped one, snake_case keys) and fall back to empty values.

// data may be the list itself or an object wrapping it under one of `keys`
export const toList = (data, ...keys) => {
  if (Array.isArray(data)) {
    return data;
  }
  for (const key of [...keys, 'items', 'results', 'data']) {
    if (Array.isArray(data?.[key])) {
      return data[key];
    }
  }
  return [];
};

export const getMerchantId = merchant => merchant?.merchant_id ?? merchant?.id;

export const getMerchantName = merchant =>
  merchant?.merchant_name || merchant?.name || merchant?.merchant?.name || 'Merchant';

// {merchantId: {name, points, value}} from /customer/points/merchants
export const pointsByMerchant = pointsData => {
  const map = {};
  toList(pointsData, 'merchants').forEach(merchant => {
    map[getMerchantId(merchant)] = {
      name: getMerchantName(merchant),
      points: Number(merchant.points) || 0,
      value: merchant.estimated_value != null ? Number(merchant.estimated_value) : null,
      programs: merchant.programs || [],
    };
  });
  return map;
};

// Set of favourite merchant ids from /customer/favorites/merchants
export const favoriteIds = favoritesData =>
  new Set(toList(favoritesData, 'merchants', 'favorites').map(getMerchantId).filter(Boolean));

// {merchantId: promo} — the first active promo per merchant from /customer/promos
export const promosByMerchant = promosData => {
  const map = {};
  toList(promosData, 'promos').forEach(promo => {
    const id = promo.merchant_id ?? promo.merchant?.id;
    if (id && !map[id] && (!promo.status || promo.status === 'ACTIVE')) {
      map[id] = promo;
    }
  });
  return map;
};

export const promoTitle = promo => promo?.title || promo?.name || 'Promotion';

// "Up to 50% per purchase" from a program or merchant's redemption cap, if present
export const redemptionNote = source => {
  const pct = source?.maximum_redemption_percentage ?? source?.max_redemption_percentage;
  if (pct == null) {
    return null;
  }
  return Number(pct) >= 100 ? 'Pay in full' : `Pay up to ${Number(pct)}%`;
};

const pick = (objects, keys) => {
  for (const obj of objects) {
    for (const key of keys) {
      if (obj?.[key] != null && obj[key] !== '') {
        return obj[key];
      }
    }
  }
  return null;
};

/**
 * Wallet account from GET /customer/wallet and GET /safehaven/customer/account-balance.
 * Returns {exists, balance, currency, bank, name, number}.
 */
export const readWalletAccount = (walletData, balanceData) => {
  const wallet = walletData?.wallet ?? walletData;
  const account = wallet?.account ?? wallet?.bank_account ?? wallet?.virtual_account;
  const balance = balanceData?.account ?? balanceData;
  const sources = [balance, account, wallet];

  const number = pick(sources, ['account_number', 'accountNumber', 'nuban']);
  const amount = pick([balance, wallet], ['available_balance', 'availableBalance', 'balance', 'account_balance']);

  return {
    exists: !!number || amount != null,
    balance: amount != null ? Number(amount) : null,
    currency: pick(sources, ['currency']) || 'NGN',
    bank: pick(sources, ['bank_name', 'bankName']) || 'Safe Haven MFB',
    name: pick(sources, ['account_name', 'accountName']),
    number: number ? String(number) : null,
  };
};

// True when the profile has a successful identity (BVN) verification
export const isIdentityVerified = verifications =>
  (Array.isArray(verifications) ? verifications : []).some(v => {
    const status = String(v?.status || '').toUpperCase();
    return v?.verified === true || ['VERIFIED', 'SUCCESS', 'SUCCESSFUL', 'APPROVED', 'COMPLETED'].includes(status);
  });
