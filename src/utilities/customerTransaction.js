// Helpers for /customer/transactions entries (points ledger rows).
// Entries carry merchant_id / program_id only, so names are looked up from
// /customer/points/merchants, which lists merchants with their programs.

import {formatMoney, formatType} from './merchantActivity';

// {merchants: {id: name}, programs: {id: name}} from /customer/points/merchants data
export const buildNameLookup = pointsData => {
  const merchants = {};
  const programs = {};
  (pointsData?.merchants || []).forEach(merchant => {
    merchants[merchant.merchant_id] = merchant.merchant_name;
    (merchant.programs || []).forEach(program => {
      programs[program.program_id] = program.program_name;
    });
  });
  return {merchants, programs};
};

export const isEarned = tx => (Number(tx.points_delta) || 0) > 0;

export const formatPoints = tx => {
  const points = Number(tx.points_delta) || 0;
  return `${points > 0 ? '+' : ''}${points} points`;
};

export const formatValue = (tx, currency = 'NGN') =>
  tx.monetary_value != null ? formatMoney(tx.monetary_value, currency) : '—';

export const formatEntryType = tx => formatType(tx.entry_type) || 'Transaction';

export const shortId = id => (id ? id.split('-')[0].toUpperCase() : 'N/A');

// Totals for every transaction with the same merchant
export const getMerchantHistory = (transactions, merchantId) => {
  const withMerchant = transactions.filter(tx => tx.merchant_id === merchantId);
  const earned = withMerchant.filter(isEarned);
  const redeemed = withMerchant.filter(tx => !isEarned(tx));
  const totalPoints = list => list.reduce((sum, tx) => sum + Math.abs(Number(tx.points_delta) || 0), 0);
  const totalValue = list => list.reduce((sum, tx) => sum + (Number(tx.monetary_value) || 0), 0);
  return {
    count: withMerchant.length,
    earnedCount: earned.length,
    earnedPoints: totalPoints(earned),
    earnedValue: totalValue(earned),
    redeemedCount: redeemed.length,
    redeemedPoints: totalPoints(redeemed),
    redeemedValue: totalValue(redeemed),
  };
};
