import React, {useState} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import FormLayout from '../../components/layout/FormLayout';
import {ChoiceGrid, DangerButton, InlineField, KeyValueList, StatusScreen} from '../../components/ui';
import Icon from '../../components/icons/Icon';
import {merchantAPI} from '../../services/api';
import {useMerchantId, ledgerEntryId} from '../../utilities/merchantData';
import {formatNumber, formatPts, formatActivityDate} from '../../utilities/format';
import {isNetworkError} from '../../utilities/errors';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Reverse a points award in full or in part.
 * Params: {activity} — a POINTS award row from GET /merchant/activities
 */
const ReverseAward = () => {
  const navigation = useNavigation();
  const {activity} = useRoute().params;
  const merchantId = useMerchantId();

  const awarded = Math.abs(Number(activity.points_delta) || 0);
  const reversible = Number(activity.reversible_points ?? activity.remaining_points ?? awarded) || 0;
  const name = activity.customer_name || 'Customer';
  const firstName = name.split(' ')[0];

  const [mode, setMode] = useState('partial');
  const [pointsText, setPointsText] = useState('');
  const [reason, setReason] = useState('');
  const [result, setResult] = useState(null);

  const full = mode === 'full';
  const typed = Number(pointsText.replace(/\D/g, '')) || 0;
  const points = full ? reversible : typed;
  const over = !full && typed > reversible;
  const valid = points > 0 && !over;

  const handleReverse = async () => {
    try {
      const response = await merchantAPI.reverseAward(merchantId, activity.program_id, ledgerEntryId(activity), {
        points: full ? undefined : points,
        reason: reason.trim(),
      });
      setResult({status: 'success', data: response.data});
    } catch (err) {
      setResult(
        isNetworkError(err)
          ? {
              status: 'pending',
              message: 'We lost connection before the reversal was confirmed. Check Activity before trying again.',
            }
          : {status: 'failed', message: err.message || "The award couldn't be reversed."},
      );
    }
  };

  if (result) {
    const success = result.status === 'success';
    return (
      <StatusScreen
        headerTitle="Reverse award"
        status={result.status}
        title={
          success ? 'Award reversed' : result.status === 'pending' ? "We couldn't confirm the reversal" : 'Award not reversed'
        }
        body={success ? `${formatPts(points)} removed from ${firstName}'s balance.` : result.message}
        details={[
          {label: 'Customer', value: name},
          activity.program_name && {label: 'Program', value: activity.program_name},
          {label: 'Reversed', value: formatPts(-points), color: colors.danger},
        ]}
        secondary={success ? undefined : {title: 'Cancel', onPress: () => navigation.goBack()}}
        primary={
          success ? {title: 'Done', onPress: () => navigation.goBack()} : {title: 'Try again', onPress: () => setResult(null)}
        }
      />
    );
  }

  return (
    <FormLayout
      title="Reverse award"
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={<DangerButton title={`Reverse ${formatPts(points)}`} onPress={handleReverse} disabled={!valid} />}>
      <View style={styles.original}>
        <View style={styles.originalTop}>
          <Text style={styles.originalName}>{name}</Text>
          <Text style={styles.originalPts}>{formatPts(awarded, {signed: true})}</Text>
        </View>
        <KeyValueList
          rows={[
            activity.program_name && {label: 'Program', value: activity.program_name},
            {
              label: 'Reason',
              value: [activity.description !== 'merchant_award' && activity.description, formatActivityDate(activity.created_at)]
                .filter(Boolean)
                .join(' · ') || '—',
            },
            {label: 'Still reversible', value: formatPts(reversible)},
          ]}
        />
      </View>

      <ChoiceGrid
        options={[
          {id: 'partial', label: 'Partial', hint: 'Take back some'},
          {id: 'full', label: 'Full', hint: `All ${formatPts(reversible)}`},
        ]}
        value={mode}
        onChange={setMode}
        tileHeight={64}
      />

      <View style={styles.fields}>
        <InlineField
          label="Points:"
          labelWidth={76}
          value={full ? formatNumber(reversible) : pointsText}
          onChangeText={text => {
            const digits = text.replace(/\D/g, '');
            setPointsText(digits ? formatNumber(digits) : '');
          }}
          editable={!full}
          placeholder="0"
          keyboardType="number-pad"
          strong
          valid={!full && typed > 0}
          inputStyle={full && styles.inputDisabled}
          error={over ? `Only ${formatPts(reversible)} can be reversed.` : undefined}
        />
        <InlineField
          label="Reason:"
          labelWidth={76}
          value={reason}
          onChangeText={setReason}
          placeholder="e.g. Item returned"
          maxLength={120}
        />
      </View>

      <View style={styles.note} accessibilityRole="alert">
        <Icon name="alert" size={18} color={colors.danger} />
        <Text style={styles.noteText}>
          {points > 0 ? `${formatPts(points)} will be removed from ${firstName}'s balance. ` : ''}This can't be undone;
          you'd need to award again.
        </Text>
      </View>
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingTop: 20,
    gap: 18,
  },
  original: {
    padding: 16,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    gap: 14,
  },
  originalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalName: {
    ...type.sectionHeading,
    color: colors.text,
  },
  originalPts: {
    ...type.amount,
    fontFamily: type.balance.fontFamily,
    fontSize: 16,
    color: colors.points,
  },
  fields: {
    gap: 12,
  },
  inputDisabled: {
    backgroundColor: '#111117',
    borderColor: colors.borderCard,
    color: colors.textSecondary,
  },
  note: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: 'rgba(245,142,155,0.08)',
    borderWidth: 1,
    borderColor: '#5A2A33',
  },
  noteText: {
    ...type.label,
    flex: 1,
    lineHeight: 18,
    color: '#F7C4CB',
  },
});

export default ReverseAward;
