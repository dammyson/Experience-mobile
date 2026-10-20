import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {ChoiceGrid, Button, KeyValueList} from '../ui';
import Icon from '../icons/Icon';
import RequestState from '../layout/RequestState';
import {merchantAPI} from '../../services/api';
import {
  IDENTIFIERS,
  readLookupCustomer,
  customerName,
  maskEmail,
  maskPhone,
  isNoMatch,
} from '../../utilities/merchantData';
import {initials} from '../../utilities/format';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Card for a customer returned by the lookup.
 *
 * Props:
 *   customer   lookup result
 *   children   action buttons under the details
 */
export const FoundCustomerCard = ({customer, children}) => {
  const name = customerName(customer);
  const memberId = customer.merchant_customer_id ?? customer.member_id;
  return (
    <View style={styles.found}>
      <View style={styles.foundTop}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials(name)}</Text>
        </View>
        <View style={styles.foundText}>
          <Text style={styles.foundName}>{name}</Text>
          <Text style={styles.foundSub}>Arena customer</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Found</Text>
        </View>
      </View>
      <KeyValueList
        rows={[
          customer.email && {label: 'Email', value: maskEmail(customer.email)},
          customer.phone_number && {label: 'Phone', value: maskPhone(customer.phone_number)},
          memberId && {label: 'Your member ID', value: memberId},
        ]}
      />
      {!!children && <View style={styles.foundActions}>{children}</View>}
    </View>
  );
};

/**
 * Find a customer by exactly one identifier (email, phone, customer ID or
 * the merchant's own member ID).
 *
 * Props:
 *   merchantId     string
 *   renderFound    (customer, identifier) => ReactNode — actions for a match
 *   renderMissing  (identifier, value) => ReactNode — shown when nobody matches
 *   missingHint    (identifier) => string — replaces the default "award as new customer" explanation
 */
const CustomerFinder = ({merchantId, renderFound, renderMissing, missingHint}) => {
  const [identifierId, setIdentifierId] = useState('phone');
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null); // {customer} | {missing: true} | {error}

  const identifier = IDENTIFIERS.find(i => i.id === identifierId);

  const handleFind = async () => {
    const query = value.trim();
    setResult(null);
    try {
      const response = await merchantAPI.lookupCustomer(merchantId, {[identifier.lookupKey]: query});
      const customer = readLookupCustomer(response.data);
      setResult(customer ? {customer} : {missing: true, query});
    } catch (err) {
      setResult(isNoMatch(err) ? {missing: true, query} : {error: err.message || 'Lookup failed'});
    }
  };

  return (
    <View style={styles.root}>
      <ChoiceGrid
        prompt="Find customer by"
        options={IDENTIFIERS.map(i => ({
          id: i.id,
          label: i.label,
          icon: <Icon name={i.icon} size={18} color={colors.text} />,
        }))}
        value={identifierId}
        onChange={id => {
          setIdentifierId(id);
          setValue('');
          setResult(null);
        }}
        tileHeight={70}
      />

      <View style={styles.searchGroup}>
        <Text style={styles.label}>{identifier.label}</Text>
        <View style={styles.searchRow}>
          <TextInput
            value={value}
            onChangeText={text => {
              setValue(text);
              setResult(null);
            }}
            placeholder={identifier.placeholder}
            placeholderTextColor={colors.textMuted}
            keyboardType={identifier.keyboardType}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={() => value.trim() && handleFind()}
            accessibilityLabel={identifier.label}
            style={styles.input}
          />
          <View style={styles.findBtn}>
            <Button title="Find" size="md" onPress={handleFind} disabled={!value.trim()} />
          </View>
        </View>
      </View>

      {result?.customer && <FoundCustomerCard customer={result.customer}>{renderFound(result.customer, identifier)}</FoundCustomerCard>}

      {result?.missing && (
        <View style={styles.missing}>
          <Text style={styles.missingTitle}>No customer matches</Text>
          <Text style={styles.missingBody}>
            {missingHint
              ? missingHint(identifier)
              : `You can still award points with this ${identifier.short}. A new customer record is created with it, and the points are added to that record.`}
          </Text>
          {renderMissing(identifier, result.query)}
        </View>
      )}

      {!!result?.error && <RequestState error={result.error} onRetry={handleFind} />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    gap: 16,
  },
  searchGroup: {
    gap: 8,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    height: 46,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 0,
    ...type.body,
    fontFamily: type.input.fontFamily,
    color: colors.text,
  },
  findBtn: {
    width: 84,
  },
  found: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: 16,
    gap: 14,
  },
  foundTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2A2240',
    borderWidth: 1,
    borderColor: '#4A3C7A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...type.bodyStrong,
    color: '#D3CBFF',
  },
  foundText: {
    flex: 1,
    gap: 2,
  },
  foundName: {
    ...type.sectionHeading,
    color: colors.text,
  },
  foundSub: {
    ...type.caption,
    color: colors.textMuted,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.successBg,
  },
  badgeText: {
    ...type.captionStrong,
    color: colors.successText,
  },
  foundActions: {
    flexDirection: 'row',
    gap: 10,
  },
  missing: {
    padding: 16,
    borderRadius: radii.card,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.borderDashed,
    gap: 8,
  },
  missingTitle: {
    ...type.bodyStrong,
    color: colors.text,
  },
  missingBody: {
    ...type.label,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

export default CustomerFinder;
