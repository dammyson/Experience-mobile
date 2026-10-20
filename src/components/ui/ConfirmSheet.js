import React, {useState} from 'react';
import {Modal, View, Text, Pressable, KeyboardAvoidingView, Platform, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyValueList} from './KeyValueCard';
import ButtonPair from './ButtonPair';
import {colors, type, radii, layout} from '../../theme/tokens';

/**
 * Bottom sheet to confirm a money or points action: grab handle, title, an
 * optional hero (e.g. the amount), key–value summary, warning note, then
 * Edit + confirm.
 *
 * The confirm button stays busy while `onConfirm`'s promise is pending, and
 * the sheet can't be dismissed meanwhile, so the action can't be sent twice.
 *
 * Props:
 *   visible       boolean
 *   title         string
 *   hero          ReactNode — shown above the rows
 *   rows          KeyValue rows (see KeyValueCard)
 *   note          string — e.g. "Bank transfers can't be reversed once sent."
 *   confirmLabel  string
 *   editLabel     string (default "Edit")
 *   onConfirm     () => Promise | void
 *   onClose       () => void — Edit, backdrop and back button
 *   loading       boolean — external busy state
 *   destructive   boolean — confirm uses the danger colour
 *   confirmDisabled boolean — e.g. while an amount in `hero` is invalid
 */
const ConfirmSheet = ({
  visible,
  title,
  hero,
  rows = [],
  note,
  confirmLabel,
  editLabel = 'Edit',
  onConfirm,
  onClose,
  loading = false,
  destructive = false,
  confirmDisabled = false,
}) => {
  const insets = useSafeAreaInsets();
  const [pending, setPending] = useState(false);
  const busy = loading || pending;

  const close = () => {
    if (!busy) {
      onClose();
    }
  };

  const confirm = async () => {
    setPending(true);
    try {
      await onConfirm?.();
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable
          style={styles.backdrop}
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel="Close"
        />
        <View
          style={[styles.sheet, {paddingBottom: Math.max(layout.bottomBar.paddingBottom, insets.bottom + 12)}]}
          accessibilityViewIsModal
          accessibilityLabel={title}>
          <View style={styles.handle} />
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          {hero}
          {rows.length > 0 && <KeyValueList rows={rows} variant="plain" />}
          {!!note && <Text style={styles.note}>{note}</Text>}
          <ButtonPair
            secondary={{title: editLabel, onPress: close, disabled: busy}}
            primary={{
              title: confirmLabel,
              onPress: confirm,
              loading: busy,
              disabled: confirmDisabled,
              variant: destructive ? 'danger' : 'primary',
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: 12,
    paddingHorizontal: layout.screenPadding,
    gap: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.sheetHandle,
  },
  title: {
    ...type.screenTitle,
    color: colors.text,
  },
  note: {
    ...type.caption,
    color: colors.textMuted,
  },
});

export default ConfirmSheet;
