import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet} from 'react-native';
import ScreenBackground from './ScreenBackground';
import ScreenHeader from './ScreenHeader';
import BottomBar from './BottomBar';
import StepProgress from '../ui/StepProgress';
import {layout} from '../../theme/tokens';

/**
 * Frame for form and flow screens: header (+ optional step bars), a scrolling
 * body that avoids the keyboard, and a footer pinned to the bottom.
 *
 * Props:
 *   title         string
 *   onBack        () => void — omit to hide the back arrow
 *   step          {current, total, label?} — adds "Step n of N" (or `label`) and the progress bars
 *   headerRight   ReactNode
 *   footer        ReactNode — usually a PrimaryButton (+ helper text)
 *   contentStyle  extra style for the scroll content
 *   refreshControl ReactElement — pull to refresh
 *   children      ReactNode
 */
const FormLayout = ({title, onBack, step, headerRight, footer, contentStyle, refreshControl, children}) => (
  <ScreenBackground>
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    <ScreenHeader
      title={title}
      onBack={onBack}
      stepLabel={step ? step.label ?? `Step ${step.current} of ${step.total}` : undefined}
      right={headerRight}
    />
    {!!step && <StepProgress total={step.total} current={step.current} />}
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, contentStyle]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={refreshControl}>
        {children}
      </ScrollView>
      {!!footer && <BottomBar>{footer}</BottomBar>}
    </KeyboardAvoidingView>
  </ScreenBackground>
);

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingTop: 20,
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 16,
    gap: 16,
  },
});

export default FormLayout;
