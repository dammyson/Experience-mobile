import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import {
  AppInput,
  PasswordInput,
  PasswordRules,
  isStrongPassword,
  PhoneField,
  PrimaryButton,
  StatusScreen,
} from '../../components/ui';
import {toNigerianPhone, isNigerianPhone} from '../../utilities/format';
import {authAPI} from '../../services/api';
import {colors, type, radii} from '../../theme/tokens';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Only Nigeria / NGN for now; shown read-only
const COUNTRY = {code: 'NG', label: 'Nigeria'};
const CURRENCY = {code: 'NGN', label: 'NGN (₦)'};

const slugify = value =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const ReadOnlyField = ({label, value}) => (
  <View style={styles.readOnlyGroup} accessible accessibilityLabel={`${label}, ${value}`}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.readOnly}>
      <Text style={styles.readOnlyText}>{value}</Text>
    </View>
  </View>
);

const MerchantRegister = () => {
  const navigation = useNavigation();
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const [business, setBusiness] = useState({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
  });
  const [slugEdited, setSlugEdited] = useState(false);
  const [admin, setAdmin] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  // Hardware / gesture back on step 2 returns to step 1 instead of leaving
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (step === 2 && !done) {
          e.preventDefault();
          setStep(1);
        }
      }),
    [navigation, step, done],
  );

  const setBusinessField = field => value => {
    setError('');
    setBusiness(prev => {
      const next = {...prev, [field]: value};
      if (field === 'name' && !slugEdited) {
        next.slug = slugify(value);
      }
      return next;
    });
  };

  const setAdminField = field => value => {
    setError('');
    setAdmin(prev => ({...prev, [field]: value}));
  };

  const slugValid = SLUG_PATTERN.test(business.slug);
  const businessValid =
    !!business.name.trim() &&
    slugValid &&
    EMAIL_PATTERN.test(business.email.trim()) &&
    isNigerianPhone(business.phone);

  const adminValid =
    !!admin.firstName.trim() &&
    !!admin.lastName.trim() &&
    EMAIL_PATTERN.test(admin.email.trim()) &&
    isNigerianPhone(admin.phoneNumber) &&
    isStrongPassword(admin.password);

  const handleRegister = async () => {
    setError('');
    try {
      await authAPI.registerMerchant({
        name: business.name.trim(),
        slug: business.slug,
        description: business.description.trim(),
        businessEmail: business.email.trim(),
        businessPhone: toNigerianPhone(business.phone),
        country: COUNTRY.code,
        currency: CURRENCY.code,
        admin: {
          firstName: admin.firstName.trim(),
          lastName: admin.lastName.trim(),
          email: admin.email.trim(),
          phoneNumber: toNigerianPhone(admin.phoneNumber),
          password: admin.password,
        },
      });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  const goToSignIn = () =>
    navigation.reset({
      index: 0,
      routes: [{name: 'Login', params: {role: 'merchant', email: admin.email.trim()}}],
    });

  if (done) {
    return (
      <StatusScreen
        headerTitle="Business registered"
        status="success"
        title={`${business.name.trim()} is registered`}
        body={`Sign in as ${admin.email.trim()} to set up your first loyalty program.`}
        primary={{title: 'Sign in to business', onPress: goToSignIn}}
      />
    );
  }

  if (step === 1) {
    return (
      <FormLayout
        title="Register your business"
        onBack={() => navigation.goBack()}
        step={{current: 1, total: 2}}
        contentStyle={styles.content}
        footer={
          <>
            <Text style={styles.helper}>Next: the admin who will sign in to manage this business.</Text>
            <PrimaryButton title="Continue" onPress={() => setStep(2)} disabled={!businessValid} />
          </>
        }>
        <Text style={styles.heading} accessibilityRole="header">
          Business details
        </Text>

        <AppInput label="Business name" value={business.name} onChangeText={setBusinessField('name')} />

        <View style={styles.slugGroup}>
          <AppInput
            label="Handle"
            value={business.slug}
            onChangeText={value => {
              setSlugEdited(true);
              setBusinessField('slug')(value.toLowerCase());
            }}
            autoCapitalize="none"
            autoCorrect={false}
            leftElement={<Text style={styles.slugPrefix}>arena/</Text>}
            accessibilityLabel="Handle"
          />
          {/* TODO: no endpoint checks handle availability; the server rejects taken handles on submit */}
          <Text
            style={[
              styles.slugHint,
              business.slug && (slugValid ? styles.slugHintOk : styles.slugHintBad),
            ]}>
            Lowercase letters, numbers and dashes
          </Text>
        </View>

        <AppInput
          label="Short description"
          value={business.description}
          onChangeText={setBusinessField('description')}
          maxLength={120}
        />
        <AppInput
          label="Business email"
          value={business.email}
          onChangeText={setBusinessField('email')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          error={
            business.email && !EMAIL_PATTERN.test(business.email.trim())
              ? 'Enter a valid email address.'
              : undefined
          }
        />
        <PhoneField label="Business phone" value={business.phone} onChangeText={setBusinessField('phone')} />

        <View style={styles.row}>
          <ReadOnlyField label="Country" value={COUNTRY.label} />
          <ReadOnlyField label="Currency" value={CURRENCY.label} />
        </View>
      </FormLayout>
    );
  }

  return (
    <FormLayout
      title="Register your business"
      onBack={() => setStep(1)}
      step={{current: 2, total: 2}}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton title="Register business" onPress={handleRegister} disabled={!adminValid} />
        </>
      }>
      <Text style={styles.heading} accessibilityRole="header">
        Admin account
      </Text>
      <Text style={styles.intro}>This person signs in to manage {business.name.trim() || 'the business'}.</Text>

      <View style={styles.row}>
        <AppInput
          label="First name"
          value={admin.firstName}
          onChangeText={setAdminField('firstName')}
          autoCapitalize="words"
          containerStyle={styles.flex}
        />
        <AppInput
          label="Last name"
          value={admin.lastName}
          onChangeText={setAdminField('lastName')}
          autoCapitalize="words"
          containerStyle={styles.flex}
        />
      </View>
      <AppInput
        label="Email address"
        value={admin.email}
        onChangeText={setAdminField('email')}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        textContentType="emailAddress"
        error={admin.email && !EMAIL_PATTERN.test(admin.email.trim()) ? 'Enter a valid email address.' : undefined}
      />
      <PhoneField value={admin.phoneNumber} onChangeText={setAdminField('phoneNumber')} />
      <PasswordInput
        label="Password"
        value={admin.password}
        onChangeText={setAdminField('password')}
        textContentType="newPassword"
      />
      <PasswordRules password={admin.password} />
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingTop: 18,
    gap: 12,
  },
  heading: {
    ...type.sectionHeading,
    color: colors.text,
  },
  intro: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textSecondary,
  },
  label: {
    ...type.label,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  slugGroup: {
    gap: 6,
  },
  slugPrefix: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: colors.textMuted,
  },
  slugHint: {
    ...type.caption,
    color: colors.textMuted,
  },
  slugHintOk: {
    color: colors.successText,
  },
  slugHintBad: {
    color: colors.danger,
  },
  readOnlyGroup: {
    flex: 1,
    gap: 8,
  },
  readOnly: {
    height: 48,
    borderRadius: radii.input,
    borderWidth: 1,
    borderColor: colors.borderCard,
    backgroundColor: '#111117',
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  readOnlyText: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    color: '#D9D9E3',
  },
  helper: {
    ...type.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default MerchantRegister;
