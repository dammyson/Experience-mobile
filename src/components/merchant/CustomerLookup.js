import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {AppInput} from '../ui';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';
import {merchantAPI} from '../../services/api';

const LOOKUP_TYPES = [
  {key: 'email', label: 'Email', placeholder: 'Enter customer email', keyboardType: 'email-address'},
  {key: 'phoneNumber', label: 'Phone', placeholder: 'Enter phone number', keyboardType: 'phone-pad'},
  {key: 'customerId', label: 'Customer ID', placeholder: 'Enter customer ID', keyboardType: 'default'},
];

export const getCustomerName = customer =>
  customer ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer' : '';

/**
 * Merchant customer search — look up by email, phone or customer ID, then
 * show the matched customer so the merchant can confirm before acting.
 *
 * Props:
 *   merchantId        string
 *   customer          object | null — the currently selected customer
 *   onCustomerChange  (customer | null) => void
 *   onError           (message) => void
 *
 * To clear the search (e.g. "start again"), remount it by changing its `key`.
 */
const CustomerLookup = ({merchantId, customer, onCustomerChange, onError}) => {
  const [lookupType, setLookupType] = useState('email');
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);

  const activeType = LOOKUP_TYPES.find(type => type.key === lookupType);

  const handleTypeChange = key => {
    setLookupType(key);
    setQuery('');
    onCustomerChange(null);
  };

  const handleLookup = async () => {
    const value = query.trim();
    if (!value) {
      return;
    }
    setSearching(true);
    onCustomerChange(null);
    try {
      const response = await merchantAPI.lookupCustomer(merchantId, {[lookupType]: value});
      const found = response.data?.customer || response.data;
      if (!found?.id) {
        throw new Error('Customer not found');
      }
      onCustomerChange(found);
    } catch (err) {
      onError(err?.message || 'Customer not found');
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <Text style={styles.sectionTitle}>Find Customer</Text>

      <View style={styles.segment}>
        {LOOKUP_TYPES.map(type => (
          <TouchableOpacity
            key={type.key}
            style={[styles.segmentItem, lookupType === type.key && styles.segmentItemActive]}
            onPress={() => handleTypeChange(type.key)}
            activeOpacity={0.8}>
            <Text style={[styles.segmentText, lookupType === type.key && styles.segmentTextActive]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <AppInput
        value={query}
        onChangeText={text => {
          setQuery(text);
          onCustomerChange(null);
        }}
        placeholder={activeType.placeholder}
        keyboardType={activeType.keyboardType}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={handleLookup}
      />

      <TouchableOpacity
        style={[styles.findButton, (!query.trim() || searching) && styles.disabled]}
        onPress={handleLookup}
        disabled={!query.trim() || searching}
        activeOpacity={0.85}>
        {searching ? (
          <ActivityIndicator color={theme.WHITE} />
        ) : (
          <Text style={styles.findText}>Find Customer</Text>
        )}
      </TouchableOpacity>

      {customer && (
        <View style={styles.customerCard}>
          <Text style={styles.customerName}>{getCustomerName(customer)}</Text>
          {!!customer.email && <Text style={styles.customerMeta}>{customer.email}</Text>}
          {!!customer.phone_number && (
            <Text style={styles.customerMeta}>{customer.phone_number}</Text>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
    marginBottom: 12,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: theme.SURFACE_COLOR,
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: theme.PRIMARY_GLASS,
  },
  segmentText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  segmentTextActive: {
    color: theme.WHITE,
  },
  findButton: {
    backgroundColor: theme.PRIMARY_SURFACE,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: spacing.xl,
  },
  findText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
  disabled: {
    opacity: 0.5,
  },
  customerCard: {
    backgroundColor: theme.SURFACE_COLOR,
    borderRadius: 16,
    padding: 16,
    marginBottom: spacing.xl,
  },
  customerName: {
    fontFamily: 'DMSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
  },
  customerMeta: {
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    marginTop: 4,
  },
});

export default CustomerLookup;
