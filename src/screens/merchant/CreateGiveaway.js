import React, {useEffect, useMemo, useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import FormLayout from '../../components/layout/FormLayout';
import RequestState from '../../components/layout/RequestState';
import {AppInput, ChoiceGrid, EmptyState, InlineField, PrimaryButton, SkeletonList} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {getMerchantPrograms} from '../../actions/merchantActions';
import {merchantAPI} from '../../services/api';
import {useMerchantId, readPrograms, readGiveaway, isOpen, isPrepaid} from '../../utilities/merchantData';
import {saveLocalGiveaway} from '../../utilities/localGiveaways';
import {formatNaira, formatNumber, formatPts} from '../../utilities/format';
import {colors, type} from '../../theme/tokens';

/**
 * New giveaway: a shareable code customers claim points with.
 * Not in the design files; built from the shared form components.
 */
const CreateGiveaway = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const merchantId = useMerchantId();
  const {programs, programsLoading, error: programsError} = useSelector(state => state.merchant);

  const [name, setName] = useState('');
  const [programId, setProgramId] = useState(null);
  const [perClaimText, setPerClaimText] = useState('');
  const [maxClaimsText, setMaxClaimsText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (merchantId && !programs) {
      dispatch(getMerchantPrograms(merchantId)).catch(() => {});
    }
  }, [dispatch, merchantId, programs]);

  const openPrograms = useMemo(() => readPrograms(programs).filter(isOpen), [programs]);
  const program = openPrograms.find(p => p.id === programId);

  const perClaim = Number(perClaimText.replace(/\D/g, '')) || 0;
  const maxClaims = Number(maxClaimsText.replace(/\D/g, '')) || 0;
  const totalPoints = perClaim * maxClaims;
  const pointValue = Number(program?.point_value) || null;
  const valid = !!name.trim() && !!program && perClaim > 0 && maxClaims > 0;

  const handleCreate = async () => {
    setError('');
    try {
      const response = await merchantAPI.createGiveaway(merchantId, {
        programId,
        name: name.trim(),
        pointsPerClaim: perClaim,
        maxClaims,
      });
      const giveaway = readGiveaway(response.data);
      if (giveaway.id) {
        await saveLocalGiveaway(merchantId, {id: giveaway.id, name: giveaway.name || name.trim(), code: giveaway.code});
      }
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
      <AppInput label="Giveaway name" value={name} onChangeText={setName} placeholder="e.g. Birthday giveaway" maxLength={60} />

      {programsLoading && !programs ? (
        <SkeletonList rows={2} />
      ) : !programs && programsError ? (
        <RequestState
          error={programsError}
          onRetry={() => dispatch(getMerchantPrograms(merchantId, true)).catch(() => {})}
        />
      ) : openPrograms.length === 0 ? (
        <EmptyState
          title="No open programs"
          hint="Giveaway points come from a program. Create one first."
          action={{label: 'New program', onPress: () => navigation.replace('CreateProgram')}}
        />
      ) : (
        <ChoiceGrid
          prompt="Points come from"
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
      )}

      <View style={styles.fields}>
        <InlineField
          label="Points each:"
          labelWidth={100}
          value={perClaimText}
          onChangeText={digits(setPerClaimText)}
          placeholder="0"
          keyboardType="number-pad"
          strong
        />
        <InlineField
          label="Max claims:"
          labelWidth={100}
          value={maxClaimsText}
          onChangeText={digits(setMaxClaimsText)}
          placeholder="0"
          keyboardType="number-pad"
        />
      </View>

      {totalPoints > 0 && (
        <Text style={styles.summary}>
          Up to {formatPts(totalPoints)}
          {pointValue ? ` (${formatNaira(totalPoints * pointValue)})` : ''} if every spot is claimed.
        </Text>
      )}
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16,
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
