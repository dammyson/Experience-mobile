// Helpers for the Safe Haven bank transfer flow. Response shapes aren't
// documented in the repo, so the readers accept camelCase and snake_case keys.

import {toList} from './customerData';

// [{id: bankCode, label: bankName}] from GET /safehaven/banks
export const readBanks = data =>
  toList(data, 'banks')
    .map(bank => ({
      id: String(bank.bankCode ?? bank.bank_code ?? bank.code ?? ''),
      label: bank.name ?? bank.bankName ?? bank.bank_name ?? '',
    }))
    .filter(bank => bank.id && bank.label)
    .sort((a, b) => a.label.localeCompare(b.label));

// {name, sessionId} from POST /safehaven/name-enquiry
export const readNameEnquiry = data => {
  const d = data?.data ?? data ?? {};
  return {
    name: d.accountName ?? d.account_name ?? d.name ?? null,
    sessionId: d.sessionId ?? d.session_id ?? d.name_enquiry_reference ?? null,
  };
};

const SUCCESS = ['SUCCESS', 'SUCCESSFUL', 'COMPLETED', 'COMPLETE', 'PAID'];
const FAILED = ['FAILED', 'FAILURE', 'DECLINED', 'REJECTED', 'REVERSED', 'CANCELLED'];

/**
 * 'success' | 'failed' | 'pending' from the transfer response. Anything the
 * bank hasn't explicitly confirmed or declined is pending — there's no status
 * endpoint to check later (README gap 3).
 */
export const transferOutcome = data => {
  const d = data?.data ?? data ?? {};
  const status = String(d.status ?? d.transfer_status ?? d.state ?? '').toUpperCase();
  if (SUCCESS.includes(status)) {
    return 'success';
  }
  if (FAILED.includes(status)) {
    return 'failed';
  }
  return 'pending';
};

// A new reference for every attempt, so a retry is never mistaken for the original
export const newPaymentReference = () =>
  `ARN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

// "25,000.5" → 25000.5; keeps at most 2 decimals
export const parseAmount = text => {
  const clean = String(text ?? '').replace(/[^\d.]/g, '');
  const [whole, fraction = ''] = clean.split('.');
  return Number(`${whole || 0}.${fraction.slice(0, 2) || 0}`);
};

// Live formatting for an amount input: "25000.5" → "₦25,000.5"
export const formatAmountInput = text => {
  const clean = String(text ?? '').replace(/[^\d.]/g, '');
  if (!clean) {
    return '';
  }
  const [whole, ...rest] = clean.split('.');
  const grouped = (whole.replace(/^0+(?=\d)/, '') || '0').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return rest.length ? `₦${grouped}.${rest.join('').slice(0, 2)}` : `₦${grouped}`;
};
