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
import CustomerLookup, {getCustomerName} from '../../components/merchant/CustomerLookup';

const AwardPoints = () => {
  const navigation = useNavigation();
  const {program} = useRoute().params;
  const {user} = useSelector(state => state.auth);
  const merchantId = user?.merchant_ids?.[0];

  const [lookupKey, setLookupKey] = useState(0);
  const [customer, setCustomer] = useState(null);
  const [points, setPoints] = useState('');
  const [reason, setReason] = useState('');
  const [awarding, setAwarding] = useState(false);
  const [awarded, setAwarded] = useState(false);
  const [error, setError] = useState(null);

  const pointsValue = parseInt(points, 10);
  const canAward = !!customer && pointsValue > 0 && !awarding;

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
    setLookupKey(key => key + 1);
    setCustomer(null);
    setPoints('');
    setReason('');
    setAwarded(false);
  };

  const customerName = getCustomerName(customer);

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
              <CustomerLookup
                key={lookupKey}
                merchantId={merchantId}
                customer={customer}
                onCustomerChange={setCustomer}
                onError={setError}
              />

              {/* Step 2 — award */}
              {customer && (
                <>
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
