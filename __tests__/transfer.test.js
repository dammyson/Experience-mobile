import {
  readBanks,
  readNameEnquiry,
  transferOutcome,
  newPaymentReference,
  parseAmount,
  formatAmountInput,
} from '../src/utilities/transfer';

describe('transfer helpers', () => {
  it('reads and sorts banks', () => {
    expect(readBanks({banks: [{name: 'Kuda', bankCode: '090267'}, {bank_name: 'Access', code: '044'}]})).toEqual([
      {id: '044', label: 'Access'},
      {id: '090267', label: 'Kuda'},
    ]);
  });

  it('reads the name enquiry result', () => {
    expect(readNameEnquiry({accountName: 'CHINEDU EZE', sessionId: 's1'})).toEqual({name: 'CHINEDU EZE', sessionId: 's1'});
    expect(readNameEnquiry({data: {account_name: 'A', session_id: 's2'}})).toEqual({name: 'A', sessionId: 's2'});
  });

  it('only reports success or failure when the response says so', () => {
    expect(transferOutcome({status: 'Completed'})).toBe('success');
    expect(transferOutcome({status: 'DECLINED'})).toBe('failed');
    expect(transferOutcome({status: 'PROCESSING'})).toBe('pending');
    expect(transferOutcome({})).toBe('pending');
  });

  it('makes a new reference each time', () => {
    expect(newPaymentReference()).not.toBe(newPaymentReference());
  });

  it('parses and formats amounts', () => {
    expect(parseAmount('₦25,000.505')).toBe(25000.5);
    expect(parseAmount('')).toBe(0);
    expect(formatAmountInput('25000')).toBe('₦25,000');
    expect(formatAmountInput('₦1,000.5')).toBe('₦1,000.5');
    expect(formatAmountInput('')).toBe('');
  });
});
