import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import ScreenBackground from '../../components/layout/ScreenBackground';
import {BackIcon} from '../../components/icons';
import {AppInput, ErrorSheet} from '../../components/ui';
import {theme} from '../../theme/colors';
import {textStyles} from '../../theme/typography';
import {spacing, radius} from '../../theme/spacing';
import {merchantAPI} from '../../services/api';

const LOOKUP_TYPES = [
  {key: 'email', label: 'Email', placeholder: 'Enter customer email', keyboardType: 'email-address'},
  {key: 'phoneNumber', label: 'Phone', placeholder: 'Enter phone number', keyboardType: 'phone-pad'},
  {key: 'customerId', label: 'Customer ID', placeholder: 'Enter customer ID', keyboardType: 'default'},
];

const AwardPoints = () => {
  const navigation = useNavigation();
  const {program} = useRoute().params;
  const {user} = useSelector(state => state.auth);
  const merchantId = user?.merchant_ids?.[0];

  const [lookupType, setLookupType] = useState('email');
  const [query, setQuery] = useState('');
  const [customer, setCustomer] = useState(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [searching, setSearching] = useState(false);
  const [awarding, setAwarding] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [error, setError] = useState(null);

  const activeType = LOOKUP_TYPES.find(type => type.key === lookupType);
  const pointsValue = parseInt(points, 10);
  const canAward = !!customer && pointsValue > 0 && !awarding;

  const handleTypeChange = key => {
    setLookupType(key);
    setQuery('');
    setCustomer(null);
  };

  const handleLookup = async () => {
    const value = query.trim();
    if (!value) {
      return;
    }
    setSearching(true);
    setCustomer(null);
    try {
      const response = await merchantAPI.lookupCustomer(merchantId, {[lookupType]: value});
      const found = response.data?.customer || response.data;
      if (!found?.id) {
        throw new Error('Customer not found');
      }
      setCustomer(found);
    } catch (err) {
      setError(err?.message || 'Customer not found');
    } finally {
      setSearching(false);
    }
  };

  const handleAward = async () => {
    setAwarding(true);
    try {
      await merchantAPI.awardPoints(merchantId, program.id, customer.id, {
        points: pointsValue,
        reason: reason.trim(),
      });
      setAwarded(true);
    } catch (err) {
      setError(err?.message || 'Failed to award points');
    } finally {
      setAwarding(false);
    }
  };

  const handleAwardAnother = () => {
    setQuery('');
    setCustomer(null);
    setPoints('');
    setReason('');
    setAwarded(false);
  };

  const customerName = customer
    ? `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer'
    : '';

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}>
          <BackIcon size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Award Points</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={styles.programName}>{program.name}</Text>

          {awarded ? (
            <View style={styles.successCard}>
              <Text style={styles.successTitle}>Points awarded</Text>
              <Text style={styles.successText}>
                {pointsValue} points sent to {customerName}.
              </Text>

              <TouchableOpacity
                style={[styles.ctaButton, styles.successButton]}
                onPress={handleAwardAnother}
                activeOpacity={0.85}>
                <Text style={styles.ctaText}>Award Another Customer</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
                <Text style={styles.linkText}>Back to Program</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Step 1 — find customer */}
              <Text style={styles.sectionTitle}>Find Customer</Text>

              <View style={styles.segment}>
                {LOOKUP_TYPES.map(type => (
                  <TouchableOpacity
                    key={type.key}
                    style={[styles.segmentItem, lookupType === type.key && styles.segmentItemActive]}
                    onPress={() => handleTypeChange(type.key)}
                    activeOpacity={0.8}>
                    <Text
                      style={[
                        styles.segmentText,
                        lookupType === type.key && styles.segmentTextActive,
                      ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <AppInput
                value={query}
                onChangeText={text => {
                  setQuery(text);
                  setCustomer(null);
                }}
                placeholder={activeType.placeholder}
                keyboardType={activeType.keyboardType}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={handleLookup}
              />

              <TouchableOpacity
                style={[styles.secondaryButton, (!query.trim() || searching) && styles.disabled]}
                onPress={handleLookup}
                disabled={!query.trim() || searching}
                activeOpacity={0.85}>
                {searching ? (
                  <ActivityIndicator color={theme.WHITE} />
                ) : (
                  <Text style={styles.ctaText}>Find Customer</Text>
                )}
              </TouchableOpacity>

              {/* Step 2 — award */}
              {customer && (
                <>
                  <View style={styles.customerCard}>
                    <Text style={styles.customerName}>{customerName}</Text>
                    {!!customer.email && <Text style={styles.customerMeta}>{customer.email}</Text>}
                    {!!customer.phone_number && (
                      <Text style={styles.customerMeta}>{customer.phone_number}</Text>
                    )}
                  </View>

                  <Text style={styles.sectionTitle}>Award Details</Text>

                  <AppInput
                    label="Points"
                    value={points}
                    onChangeText={text => setPoints(text.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 100"
                    keyboardType="number-pad"
                  />

                  <View style={styles.spacer} />

                  <AppInput
                    label="Reason"
                    value={reason}
                    onChangeText={setReason}
                    placeholder="e.g. promo bonus"
                  />

                  <TouchableOpacity
                    style={[styles.ctaButton, !canAward && styles.disabled]}
                    onPress={handleAward}
                    disabled={!canAward}
                    activeOpacity={0.85}>
                    {awarding ? (
                      <ActivityIndicator color={theme.WHITE} />
                    ) : (
                      <Text style={styles.ctaText}>
                        Award {pointsValue > 0 ? `${pointsValue} ` : ''}Points
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <ErrorSheet visible={!!error} message={error} onClose={() => setError(null)} />
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.base,
    paddingBottom: 40,
  },
  programName: {
    ...textStyles.textMd,
    color: theme.TEXT_TERTIARY,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
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
    fontFamily: 'PlusJakartaSans-Medium',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
  },
  segmentTextActive: {
    color: theme.WHITE,
  },
  secondaryButton: {
    backgroundColor: theme.PRIMARY_SURFACE,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: spacing.xl,
  },
  customerCard: {
    backgroundColor: theme.SURFACE_COLOR,
    borderRadius: 16,
    padding: 16,
    marginBottom: spacing.xl,
  },
  customerName: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 16,
    color: theme.TEXT_PRIMARY,
  },
  customerMeta: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    marginTop: 4,
  },
  spacer: {
    height: 20,
  },
  ctaButton: {
    backgroundColor: theme.PRIMARY_GLASS,
    borderRadius: radius.xl,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  ctaText: {
    ...textStyles.textLgBold,
    color: theme.WHITE,
  },
  disabled: {
    opacity: 0.5,
  },
  successCard: {
    backgroundColor: theme.SURFACE_COLOR,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  successTitle: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 18,
    color: theme.TEXT_PRIMARY,
  },
  successText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    color: theme.TEXT_TERTIARY,
    marginTop: 8,
    textAlign: 'center',
  },
  successButton: {
    alignSelf: 'stretch',
  },
  linkText: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontSize: 14,
    color: theme.PRIMARY_COLOR,
    marginTop: 16,
  },
});

export default AwardPoints;
