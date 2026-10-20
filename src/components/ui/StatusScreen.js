import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import Icon from '../icons/Icon';
import ScreenBackground from '../layout/ScreenBackground';
import ScreenHeader from '../layout/ScreenHeader';
import BottomBar from '../layout/BottomBar';
import KeyValueCard from './KeyValueCard';
import ButtonPair from './ButtonPair';
import PrimaryButton from './PrimaryButton';
import {colors, type, layout} from '../../theme/tokens';

const STATUS = {
  success: {icon: 'check', color: colors.success, ring: colors.successBg},
  pending: {icon: 'pending', color: colors.pending, ring: colors.pendingBg},
  failed: {icon: 'failed', color: colors.danger, ring: colors.dangerBg},
};

export const statusColor = status => STATUS[status]?.color ?? colors.text;

/**
 * 64px icon circle in the status colour.
 *
 * Props:
 *   status  'success' | 'pending' | 'failed'
 *   size    number (default 64)
 */
export const StatusIcon = ({status, size = 64}) => {
  const s = STATUS[status] ?? STATUS.pending;
  return (
    <View style={[styles.ring, {width: size, height: size, borderRadius: size / 2, backgroundColor: s.ring}]}>
      <Icon name={s.icon} size={Math.round(size * 0.44)} color={s.color} strokeWidth={2.2} />
    </View>
  );
};

/**
 * Vertical progress list. Step shape: {label, state: 'done' | 'fail' | 'todo'}
 */
export const ProgressTimeline = ({title = 'Progress', steps}) => (
  <View style={styles.timeline}>
    <Text style={styles.timelineTitle} accessibilityRole="header">
      {title}
    </Text>
    {steps.map(step => {
      const done = step.state === 'done';
      const fail = step.state === 'fail';
      return (
        <View
          key={step.label}
          style={styles.step}
          accessible
          accessibilityLabel={`${step.label}, ${done ? 'done' : fail ? 'failed' : 'not yet'}`}>
          <View
            style={[
              styles.stepDot,
              done && styles.stepDotDone,
              fail && styles.stepDotFail,
            ]}>
            {(done || fail) && (
              <Icon name={fail ? 'failed' : 'check'} size={12} color={colors.white} strokeWidth={2.6} />
            )}
          </View>
          <Text style={[styles.stepLabel, step.state === 'todo' && styles.stepLabelTodo]}>
            {step.label}
          </Text>
        </View>
      );
    })}
  </View>
);

/**
 * Full result screen: centred status icon, title, body, optional details card
 * and timeline, then a ButtonPair (or a single primary button).
 *
 * Props:
 *   headerTitle  string — centred header title
 *   status       'success' | 'pending' | 'failed'
 *   title        string
 *   body         string
 *   details      KeyValue rows
 *   steps        timeline steps
 *   children     extra content under the body (e.g. a progress bar)
 *   secondary    {title, onPress} — omit for a single button
 *   primary      {title, onPress}
 */
const StatusScreen = ({headerTitle, status, title, body, details, steps, children, secondary, primary}) => (
  <ScreenBackground>
    {!!headerTitle && <ScreenHeader title={headerTitle} centered />}
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero} accessibilityLiveRegion="polite" accessible accessibilityLabel={`${title}. ${body || ''}`}>
        <StatusIcon status={status} />
        <Text style={styles.title}>{title}</Text>
        {!!body && <Text style={styles.body}>{body}</Text>}
      </View>
      {children}
      {details?.length > 0 && <KeyValueCard rows={details} />}
      {steps?.length > 0 && <ProgressTimeline steps={steps} />}
    </ScrollView>
    <BottomBar>
      {secondary ? (
        <ButtonPair secondary={secondary} primary={primary} />
      ) : (
        <PrimaryButton {...primary} />
      )}
    </BottomBar>
  </ScreenBackground>
);

const styles = StyleSheet.create({
  content: {
    paddingTop: 28,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 16,
    gap: 22,
  },
  hero: {
    alignItems: 'center',
    gap: 10,
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...type.statusTitle,
    color: colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  body: {
    ...type.body,
    fontFamily: type.label.fontFamily,
    lineHeight: 20,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
  timeline: {
    gap: 12,
  },
  timelineTitle: {
    ...type.sectionHeadingSm,
    color: colors.text,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.sheetHandle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryBorder,
  },
  stepDotFail: {
    backgroundColor: colors.dangerButton,
    borderColor: colors.danger,
  },
  stepLabel: {
    ...type.label,
    color: colors.text,
  },
  stepLabelTodo: {
    color: colors.tabInactive,
  },
});

export default StatusScreen;
