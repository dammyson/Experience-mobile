import React, {useMemo, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {PickerSheet} from '../ui';
import {merchantAPI} from '../../services/api';
import useRequest from '../../utilities/useRequest';
import {toList, getMerchantId, getMerchantName} from '../../utilities/customerData';
import {colors, type, radii} from '../../theme/tokens';

/**
 * "Where points can be spent": this business plus any other merchants picked
 * from a multi-select sheet. Build `redeemable_merchant_ids` as
 * [merchantId, ...value].
 *
 * Props:
 *   merchantId    this business — always included, can't be unticked
 *   businessName  string
 *   value         other merchant ids
 *   onChange      (ids) => void
 */
const RedeemableMerchantsField = ({merchantId, businessName, value, onChange}) => {
  const [open, setOpen] = useState(false);
  // If the directory can't be loaded, points stay redeemable at this business only
  const directory = useRequest(() => merchantAPI.listMerchants(), []);

  const options = useMemo(() => {
    const others = toList(directory.data, 'merchants')
      .map(m => ({id: String(getMerchantId(m)), label: getMerchantName(m)}))
      .filter(m => m.id && m.id !== String(merchantId));
    return [{id: String(merchantId), label: `${businessName} (you)`, disabled: true}, ...others];
  }, [directory.data, merchantId, businessName]);

  const otherNames = options.filter(m => value.includes(m.id)).map(m => m.label);
  const unavailable = directory.loading || !!directory.error;

  const toggle = option =>
    onChange(value.includes(option.id) ? value.filter(id => id !== option.id) : [...value, option.id]);

  return (
    <>
      <View style={styles.card}>
        <View style={styles.text}>
          <Text style={styles.label}>Where points can be spent</Text>
          <Text style={styles.value}>
            {otherNames.length ? `${businessName} + ${otherNames.join(', ')}` : `Only at ${businessName}`}
          </Text>
          {!!directory.error && <Text style={styles.hint}>Other merchants couldn't be loaded.</Text>}
        </View>
        <TouchableOpacity
          onPress={() => setOpen(true)}
          disabled={unavailable}
          accessibilityRole="button"
          accessibilityLabel="Choose merchants"
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={[styles.link, unavailable && styles.linkDisabled]}>
            {directory.loading ? 'Loading…' : 'Choose'}
          </Text>
        </TouchableOpacity>
      </View>
      <PickerSheet
        visible={open}
        title="Where points can be spent"
        options={options}
        value={[String(merchantId), ...value]}
        onSelect={toggle}
        onClose={() => setOpen(false)}
        multiple
        searchPlaceholder="Search merchants"
        emptyText="No merchants found"
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  text: {
    flex: 1,
    gap: 4,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  value: {
    ...type.bodyStrong,
    color: colors.text,
  },
  hint: {
    ...type.caption,
    color: colors.textMuted,
  },
  link: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
  linkDisabled: {
    color: colors.textMuted,
  },
});

export default RedeemableMerchantsField;
