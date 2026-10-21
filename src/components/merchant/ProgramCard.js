import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {isPrepaid, isOpen, programRule, programTag, readBalance} from '../../utilities/merchantData';
import {formatNaira, formatPts} from '../../utilities/format';
import dayjs from 'dayjs';
import {colors, type, radii} from '../../theme/tokens';

const Tag = ({tag, uppercase}) => (
  <View style={[styles.tag, {backgroundColor: tag.bg}]}>
    <Text style={[styles.tagText, uppercase && styles.tagUpper, {color: tag.fg}]}>{tag.label}</Text>
  </View>
);

const FundingBar = ({pct, color}) => (
  <View style={styles.track} importantForAccessibility="no">
    <View style={[styles.fill, {width: `${Math.round(pct * 100)}%`, backgroundColor: color}]} />
  </View>
);

/**
 * Program summary card.
 *
 * Props:
 *   program   program from GET /merchant/programs
 *   balance   GET …/balance response (optional, adds funding figures)
 *   compact   boolean — Overview layout (bar + one line of figures)
 *   action    {label, note, onPress, primary} — footer action (Close / Settle)
 *   onPress   () => void
 */
const ProgramCard = ({program, balance, compact, action, onPress}) => {
  const tag = programTag(program, balance);
  const b = readBalance(balance);
  const prepaid = isPrepaid(program);
  const open = isOpen(program);
  const currency = balance?.currency || program.currency;
  const money = value => (value != null ? formatNaira(value, {currency}) : '—');
  const showBar = prepaid && open && b.pct != null;

  if (compact) {
    const [left, right] = prepaid
      ? [`${money(b.left)} funding left`, b.funded != null ? `of ${money(b.funded)}` : '']
      : [b.pointsAwarded != null ? `${formatPts(b.pointsAwarded)} awarded` : `${money(b.due)} owed so far`, 'Billed when closed'];
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`${program.name}, ${tag.label}, ${left}`}>
        <View style={styles.top}>
          <Text style={styles.nameCompact} numberOfLines={1}>
            {program.name}
          </Text>
          <Tag tag={{...tag, label: prepaid ? 'Prepaid' : 'Postpaid'}} uppercase />
        </View>
        {showBar && <FundingBar pct={b.pct} color={colors.success} />}
        <View style={styles.compactFigures}>
          <Text style={styles.figureText}>{left}</Text>
          <Text style={styles.figureText}>{right}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const stats = !open
    ? [
        {k: tag.pending ? 'Amount due' : 'Billed', v: money(b.due), c: tag.pending ? colors.pending : colors.text},
        b.pointsAwarded != null && {k: 'Awarded', v: formatPts(b.pointsAwarded), c: colors.points},
        program.closed_at && {k: 'Closed', v: dayjs(program.closed_at).format('D MMM'), c: colors.text},
      ]
    : prepaid
      ? [
          {k: 'Funding left', v: money(b.left), c: colors.success},
          {k: 'Funded', v: money(b.funded), c: colors.text},
          {k: 'Expiry', v: 'Never', c: colors.text},
        ]
      : [
          b.pointsAwarded != null && {k: 'Awarded', v: formatPts(b.pointsAwarded), c: colors.points},
          {k: 'Owed if closed', v: money(b.due), c: colors.text},
          {k: 'Expiry', v: 'Never', c: colors.text},
        ];

  return (
    <TouchableOpacity
      style={[styles.card, styles.cardFull, {borderColor: tag.frame}]}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`${program.name}, ${tag.label}`}>
      <View style={styles.top}>
        <View style={styles.titleBlock}>
          <Text style={styles.name}>{program.name}</Text>
          {!!programRule(program) && <Text style={styles.rule}>{programRule(program)}</Text>}
        </View>
        <Tag tag={tag} />
      </View>
      {showBar && <FundingBar pct={b.pct} color={colors.success} />}
      <View style={styles.stats}>
        {stats.filter(Boolean).map(s => (
          <View key={s.k} style={styles.stat}>
            <Text style={styles.statKey}>{s.k}</Text>
            <Text style={[styles.statValue, {color: s.c}]}>{s.v}</Text>
          </View>
        ))}
      </View>
      {!!action && (
        <View style={styles.actionRow}>
          <Text style={[styles.actionNote, action.primary && styles.actionNoteWarn]}>{action.note}</Text>
          <TouchableOpacity
            onPress={action.onPress}
            style={[styles.actionBtn, action.primary && styles.actionBtnPrimary]}
            hitSlop={{top: 6, bottom: 6}}
            accessibilityRole="button"
            accessibilityLabel={`${action.label}, ${program.name}`}
            activeOpacity={0.85}>
            <Text style={[styles.actionText, action.primary && styles.actionTextPrimary]}>{action.label}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
    padding: 14,
    gap: 10,
  },
  cardFull: {
    borderRadius: radii.card,
    gap: 12,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  nameCompact: {
    ...type.bodyStrong,
    color: colors.text,
    flex: 1,
  },
  name: {
    ...type.sectionHeading,
    color: colors.text,
  },
  rule: {
    ...type.caption,
    color: colors.textMuted,
  },
  tag: {
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: radii.pill,
  },
  tagText: {
    ...type.captionStrong,
  },
  tagUpper: {
    fontFamily: type.balance.fontFamily,
    letterSpacing: 0.66,
    textTransform: 'uppercase',
  },
  track: {
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.borderCard,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
  },
  compactFigures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  figureText: {
    ...type.caption,
    ...type.tabular,
    color: colors.textMuted,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
  },
  stat: {
    flex: 1,
    gap: 2,
  },
  statKey: {
    ...type.caption,
    color: colors.textMuted,
  },
  statValue: {
    ...type.amount,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
  },
  actionNote: {
    ...type.caption,
    flex: 1,
    lineHeight: 15,
    color: colors.textMuted,
  },
  actionNoteWarn: {
    color: '#F5D08A',
  },
  actionBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.sheetHandle,
    justifyContent: 'center',
  },
  actionBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionText: {
    ...type.label,
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.text,
  },
  actionTextPrimary: {
    color: colors.white,
  },
});

export default ProgramCard;
