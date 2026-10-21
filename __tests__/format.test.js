import {formatPts, formatNaira, formatEstimate, initials, toNigerianPhone, isNigerianPhone} from '../src/utilities/format';
import {isStrongPassword} from '../src/components/ui/PasswordRules';

describe('amount formatting', () => {
  it('formats points with a pts suffix', () => {
    expect(formatPts(4200)).toBe('4,200 pts');
    expect(formatPts(120, {signed: true})).toBe('+120 pts');
    expect(formatPts(-2400)).toBe('−2,400 pts');
  });

  it('formats naira with 2 decimals', () => {
    expect(formatNaira(184250)).toBe('₦184,250.00');
    expect(formatNaira(-25000)).toBe('−₦25,000.00');
  });

  it('formats estimates as whole naira', () => {
    expect(formatEstimate(2100.4)).toBe('≈ ₦2,100');
  });

  it('builds initials', () => {
    expect(initials('Ada Okafor')).toBe('AO');
    expect(initials('kopi')).toBe('K');
  });
});

describe('Nigerian phone numbers', () => {
  it('normalises local and pasted formats', () => {
    expect(toNigerianPhone('0803 000 0000')).toBe('+2348030000000');
    expect(toNigerianPhone('803 000 0000')).toBe('+2348030000000');
    expect(toNigerianPhone('+234 803 000 0000')).toBe('+2348030000000');
  });

  it('requires 10 digits after +234', () => {
    expect(isNigerianPhone('0803 000 0000')).toBe(true);
    expect(isNigerianPhone('0803 000')).toBe(false);
  });
});

describe('password rules', () => {
  it('needs length, mixed case, a number and a symbol', () => {
    expect(isStrongPassword('SecurePass1')).toBe(false);
    expect(isStrongPassword('SecurePass1!')).toBe(true);
    expect(isStrongPassword('short1!A')).toBe(true);
    expect(isStrongPassword('alllower1!')).toBe(false);
  });
});

describe('spendable conversions', () => {
  const {pointValue, pointsForAmount, valueOfPoints} = require('../src/utilities/spendable');
  const summary = {points: 4200, value: 2100};

  it('derives the point value', () => {
    expect(pointValue(summary)).toBe(0.5);
    expect(pointValue({points: 0, value: 0})).toBeNull();
  });

  it('converts between points and naira', () => {
    expect(pointsForAmount(summary, 1800)).toBe(3600);
    expect(pointsForAmount(summary, 1800.25)).toBe(3601);
    expect(valueOfPoints(summary, 500)).toBe(250);
    expect(pointsForAmount({points: 10, value: null}, 100)).toBeNull();
  });
});
