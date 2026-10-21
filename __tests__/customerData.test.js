import {
  toList,
  pointsByMerchant,
  favoriteIds,
  promosByMerchant,
  redemptionNote,
  readWalletAccount,
  isIdentityVerified,
} from '../src/utilities/customerData';

describe('toList', () => {
  it('accepts a bare list or a wrapped one', () => {
    expect(toList([1, 2])).toEqual([1, 2]);
    expect(toList({merchants: [1]}, 'merchants')).toEqual([1]);
    expect(toList({items: [3]}, 'merchants')).toEqual([3]);
    expect(toList(null, 'merchants')).toEqual([]);
  });
});

describe('points and favourites', () => {
  it('maps points by merchant id', () => {
    const map = pointsByMerchant({
      merchants: [{merchant_id: 'm1', merchant_name: 'Kopi', points: '4200', estimated_value: 2100}],
    });
    expect(map.m1).toMatchObject({name: 'Kopi', points: 4200, value: 2100});
  });

  it('reads favourite ids from either id field', () => {
    const ids = favoriteIds([{merchant_id: 'a'}, {id: 'b'}]);
    expect([...ids]).toEqual(['a', 'b']);
  });

  it('keeps the first active promo per merchant', () => {
    const map = promosByMerchant({
      promos: [
        {merchant_id: 'm1', title: 'Paused', status: 'INACTIVE'},
        {merchant_id: 'm1', title: 'Double points', status: 'ACTIVE'},
      ],
    });
    expect(map.m1.title).toBe('Double points');
  });

  it('describes the redemption cap', () => {
    expect(redemptionNote({maximum_redemption_percentage: 50})).toBe('Pay up to 50%');
    expect(redemptionNote({maximum_redemption_percentage: 100})).toBe('Pay in full');
    expect(redemptionNote({})).toBeNull();
  });
});

describe('readWalletAccount', () => {
  it('combines the wallet and balance responses', () => {
    const account = readWalletAccount(
      {account_number: '0123456789', account_name: 'Ada Okafor'},
      {available_balance: '184250.5'},
    );
    expect(account).toMatchObject({
      exists: true,
      balance: 184250.5,
      number: '0123456789',
      name: 'Ada Okafor',
      bank: 'Safe Haven MFB',
    });
  });

  it('reports no wallet when neither response has data', () => {
    expect(readWalletAccount(null, null).exists).toBe(false);
  });
});

describe('isIdentityVerified', () => {
  it('needs a successful verification', () => {
    expect(isIdentityVerified([{type: 'BVN', status: 'VERIFIED'}])).toBe(true);
    expect(isIdentityVerified([{type: 'BVN', status: 'FAILED'}])).toBe(false);
    expect(isIdentityVerified(undefined)).toBe(false);
  });
});
