import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {AppInput, ChoiceGrid, EmptyState, InlineField, PrimaryButton, SkeletonList} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import RedeemableMerchantsField from '../../components/merchant/RedeemableMerchantsField';
import {getMerchantPrograms} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import {
  useMerchantId,
  readGiveaway,
  readMerchantProfile,
  readPrograms,
  isOpen,
  isPrepaid,
} from '../../utilities/merchantData';
import {formatNaira, formatNumber, formatPts} from '../../utilities/format';
import {colors, type, radii} from '../../theme/tokens';

const LABEL_WIDTH = 124;
const CODE_PATTERN = /^[A-Z0-9-]{4,64}$/;

const EXPLAIN = {
  STANDALONE: 'A giveaway with its own points rules. Customers claim points with the code.',
  PROGRAM: "Points come out of an existing program's funding and follow that program's rules.",
};

/**
 * New giveaway: a shareable code customers claim points with. Either
 * standalone (POST /merchant/giveaways) or funded from an existing program
 * (POST /merchant/programs/{id}/giveaways).
 * Not in the design files; built from the shared form components.
 *
 * Params: programId — optional; opens on "From a program" with it selected
 */
const CreateGiveaway = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {profile, wallet, programs, programsLoading, error: programsError} = useSelector(state => state.merchant);
  const business = readMerchantProfile(profile);
  const currency = profile?.merchant?.currency || wallet?.currency || 'NGN';

  const [source, setSource] = useState(route.params?.programId ? 'PROGRAM' : 'STANDALONE');
  const [programId, setProgramId] = useState(route.params?.programId ?? null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [earnText, setEarnText] = useState('1');
  const [perCustomerText, setPerCustomerText] = useState('');
  const [maxBeneficiariesText, setMaxBeneficiariesText] = useState('');
  const [expiryText, setExpiryText] = useState('');
  const [code, setCode] = useState('');
  const [otherMerchantIds, setOtherMerchantIds] = useState([]);
  const [error, setError] = useState('');

  const fromProgram = source === 'PROGRAM';

  useEffect(() => {
    if (fromProgram && merchantId && !programs) {
      dispatch(getMerchantPrograms(merchantId)).catch(() => {});
    }
  }, [dispatch, fromProgram, merchantId, programs]);

  const openPrograms = useMemo(() => readPrograms(programs).filter(isOpen), [programs]);
  const program = openPrograms.find(p => p.id === programId);

  const earn = Number(earnText) || 0;
  const perCustomer = Number(perCustomerText.replace(/\D/g, '')) || 0;
  const maxBeneficiaries = Number(maxBeneficiariesText.replace(/\D/g, '')) || 0;
  const expirationDays = Number(expiryText) || 0;
  const totalPoints = perCustomer * maxBeneficiaries;
  const pointValue = fromProgram ? Number(program?.point_value) || null : null;
  const codeValid = !code || CODE_PATTERN.test(code);
  const valid =
    !!name.trim() &&
    perCustomer > 0 &&
    maxBeneficiaries > 0 &&
    codeValid &&
    (fromProgram ? !!program : earn > 0);

  const handleCreate = async () => {
    setError('');
    const common = {
      name: name.trim(),
      description: description.trim(),
      pointsPerCustomer: perCustomer,
      maxBeneficiaries,
      giveawayCode: code,
    };
    try {
      const response = fromProgram
        ? await merchantAPI.createProgramGiveaway(merchantId, programId, {...common, expirationDays})
        : await merchantAPI.createGiveaway(merchantId, {
            ...common,
            currency,
            pointsPerCurrencyUnit: earn,
            redeemableMerchantIds: [String(merchantId), ...otherMerchantIds],
          });
      const giveaway = readGiveaway(response.data);
      navigation.replace('Giveaway', {giveawayId: giveaway.id, name: name.trim(), initial: response.data});
    } catch (err) {
      setError(err.message || "The giveaway couldn't be created.");
    }
  };

  const digits = setter => text => {
    const d = text.replace(/\D/g, '');
    setter(d ? formatNumber(d) : '');
  };

  return (
    <FormLayout
      title="New giveaway"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton title="Create giveaway" onPress={handleCreate} disabled={!valid} />
        </>
      }>
      <ChoiceGrid
        prompt="Where do the points come from?"
        options={[
          {id: 'STANDALONE', label: 'New giveaway', icon: <Icon name="ticket" size={22} color={colors.text} />},
          {id: 'PROGRAM', label: 'From a program', icon: <Icon name="programs" size={22} color={colors.text} />},
        ]}
        value={source}
        onChange={id => {
          setSource(id);
          setError('');
        }}
        tileHeight={84}
      />
      <Text style={styles.explain}>{EXPLAIN[source]}</Text>

      {fromProgram &&
        (programsLoading && !programs ? (
          <SkeletonList rows={2} />
        ) : !programs && programsError ? (
          <RequestState
            error={programsError}
            onRetry={() => dispatch(getMerchantPrograms(merchantId, true)).catch(() => {})}
          />
        ) : openPrograms.length === 0 ? (
          <EmptyState
            title="No open programs"
            hint="Create a program first, or make a new giveaway instead."
            action={{label: 'New program', onPress: () => navigation.replace('CreateProgram')}}
          />
        ) : (
          <ChoiceGrid
            prompt="Program"
            options={openPrograms.map(p => ({
              id: p.id,
              label: p.name,
              hint: isPrepaid(p) ? 'Prepaid' : 'Postpaid',
              icon: <Icon name={isPrepaid(p) ? 'wallet' : 'receipt'} size={20} color={colors.text} />,
            }))}
            value={programId}
            onChange={setProgramId}
            tileHeight={84}
          />
        ))}

      <AppInput label="Giveaway name" value={name} onChangeText={setName} placeholder="e.g. Birthday giveaway" maxLength={150} />
      <AppInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="Optional"
        maxLength={160}
      />

      <View style={styles.fields}>
        <InlineField
          label="Points each:"
          labelWidth={LABEL_WIDTH}
          value={perCustomerText}
          onChangeText={digits(setPerCustomerText)}
          placeholder="0"
          keyboardType="number-pad"
          strong
        />
        <InlineField
          label="Max customers:"
          labelWidth={LABEL_WIDTH}
          value={maxBeneficiariesText}
          onChangeText={digits(setMaxBeneficiariesText)}
          placeholder="0"
          keyboardType="number-pad"
        />
        {fromProgram ? (
          <InlineField
            label="Expires (days):"
            labelWidth={LABEL_WIDTH}
            value={expiryText}
            onChangeText={text => setExpiryText(text.replace(/\D/g, ''))}
            placeholder="Never"
            keyboardType="number-pad"
          />
        ) : (
          <InlineField
            label="Points per ₦1:"
            labelWidth={LABEL_WIDTH}
            value={earnText}
            onChangeText={text => setEarnText(text.replace(/[^\d.]/g, ''))}
            keyboardType="decimal-pad"
          />
        )}
      </View>

      {totalPoints > 0 && (
        <Text style={styles.summary}>
          Up to {formatPts(totalPoints)}
          {pointValue ? ` (${formatNaira(totalPoints * pointValue)})` : ''} if every customer claims
          {fromProgram && expirationDays > 0 ? `, within ${expirationDays} day${expirationDays === 1 ? '' : 's'}` : ''}.
        </Text>
      )}

      <AppInput
        label="Giveaway code"
        value={code}
        onChangeText={text => setCode(text.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
        placeholder="Leave blank to generate one"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={64}
        error={!codeValid ? 'Use at least 4 letters or numbers.' : undefined}
      />

      {!fromProgram && (
        <RedeemableMerchantsField
          merchantId={merchantId}
          businessName={business.name}
          value={otherMerchantIds}
          onChange={setOtherMerchantIds}
        />
      )}
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  explain: {
    ...type.label,
    lineHeight: 18,
    color: '#D9D9E3',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: 'rgba(107,78,240,0.10)',
    borderWidth: 1,
    borderColor: '#3A2E6E',
    overflow: 'hidden',
  },
  fields: {
    gap: 12,
  },
  summary: {
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

export default CreateGiveaway;
