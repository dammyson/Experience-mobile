jest.mock('react-redux', () => ({useSelector: jest.fn()}));

import {
  programRule,
  readBalance,
  programTag,
  isOpen,
  maskEmail,
  maskPhone,
  isNoMatch,
  activityRow,
  readGiveaway,
  readMerchantProfile,
} from '../src/utilities/merchantData';

describe('programs', () => {
  it('describes the earning rule', () => {
    expect(
      programRule({points_per_currency_unit: 1, point_value: 0.5, maximum_redemption_percentage: 50}),
    ).toBe('1 pt per ₦1 · ₦0.50 per pt · up to 50% of a purchase');
  });

  it('works out funding left', () => {
    expect(readBalance({funding_amount: 500000, funded_amount_used: 180000})).toMatchObject({left: 320000, pct: 0.64});
  });

  it('tags programs by billing type and settlement', () => {
    expect(programTag({billing_type: 'PREPAID', status: 'ACTIVE'}).label).toBe('Prepaid');
    expect(programTag({billing_type: 'POSTPAID', status: 'ACTIVE'}).label).toBe('Postpaid · open');
    const closed = programTag({billing_type: 'POSTPAID', status: 'CLOSED'}, {amount_due: 31200});
    expect(closed).toMatchObject({label: 'Closed · payment pending', pending: true});
    expect(programTag({status: 'CLOSED'}, {amount_due: 0}).label).toBe('Closed');
    expect(isOpen({})).toBe(true);
  });
});

describe('customers', () => {
  it('masks contact details', () => {
    expect(maskEmail('ada.okafor@example.com')).toBe('ada.o•••@example.com');
    expect(maskPhone('+2348030000000')).toBe('+234803 ••• 0000');
  });

  it('tells "no match" apart from outages', () => {
    expect(isNoMatch(new Error('Customer not found'))).toBe(true);
    expect(isNoMatch(new Error('Internal server error'))).toBe(false);
  });
});

describe('activityRow', () => {
  it('marks awards with a ledger entry as reversible', () => {
    const row = activityRow({
      activity_type: 'POINTS',
      type: 'MERCHANT_AWARD',
      points_delta: 500,
      customer_name: 'Ada Okafor',
      program_id: 'p1',
      ledger_entry_id: 'l1',
    });
    expect(row).toMatchObject({title: 'Merchant Award · Ada Okafor', amount: '+500 pts', reversible: true});
  });

  it('never offers to reverse a reversal', () => {
    const row = activityRow({activity_type: 'POINTS', type: 'AWARD_REVERSAL', points_delta: -80, program_id: 'p1', ledger_entry_id: 'l2'});
    expect(row.reversible).toBe(false);
    expect(row.amount).toBe('−80 pts');
  });

  it('formats wallet movements as money', () => {
    const row = activityRow({activity_type: 'WALLET', type: 'FUNDING', amount: 200000, direction: 'CREDIT', currency: 'NGN'});
    expect(row.amount).toBe('+₦200,000.00');
  });
});

describe('giveaways and profile', () => {
  it('reads claim progress', () => {
    expect(readGiveaway({code: 'KOPI-7Q2X', points_per_claim: 60, max_claims: 100, claims_count: 37})).toMatchObject({
      code: 'KOPI-7Q2X',
      pointsGiven: 2220,
      spotsLeft: 63,
      active: true,
    });
  });

  it('reads verification from the merchant profile', () => {
    expect(readMerchantProfile({merchant: {name: 'Kopi House', verification_status: 'VERIFIED'}})).toMatchObject({
      name: 'Kopi House',
      verified: true,
    });
  });
});
