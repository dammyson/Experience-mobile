import React, {useMemo, useState} from 'react';
import {Modal, View, Text, FlatList, Pressable, TouchableOpacity, StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SearchInput from './SearchInput';
import Icon from '../icons/Icon';
import {colors, type, radii, layout} from '../../theme/tokens';

/**
 * Searchable list in a tall bottom sheet (e.g. bank picker).
 *
 * Props:
 *   visible     boolean
 *   title       string
 *   options     [{id, label}]
 *   value       selected id
 *   onSelect    (option) => void
 *   onClose     () => void
 *   searchPlaceholder string
 *   emptyText   string
 */
const PickerSheet = ({visible, title, options, value, onSelect, onClose, searchPlaceholder = 'Search', emptyText = 'No matches'}) => {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter(o => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const close = () => {
    setQuery('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={styles.backdrop} onPress={close} accessibilityRole="button" accessibilityLabel="Close" />
        <View style={[styles.sheet, {paddingBottom: insets.bottom + 12, marginTop: insets.top + 40}]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {title}
            </Text>
            <TouchableOpacity onPress={close} style={styles.closeBtn} accessibilityRole="button" accessibilityLabel="Close">
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <SearchInput value={query} onChangeText={setQuery} placeholder={searchPlaceholder} />
          <FlatList
            data={filtered}
            keyExtractor={item => String(item.id)}
            keyboardShouldPersistTaps="handled"
            renderItem={({item}) => {
              const selected = item.id === value;
              return (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    setQuery('');
                    onSelect(item);
                  }}
                  accessibilityRole="button"
                  accessibilityState={{selected}}
                  activeOpacity={0.7}>
                  <Text style={[styles.optionLabel, selected && styles.optionSelected]}>{item.label}</Text>
                  {selected && <Icon name="check" size={18} color={colors.link} strokeWidth={2.4} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
          />
        </View>
      </View>
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
    flex: 1,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: 12,
    paddingHorizontal: layout.screenPadding,
    gap: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.sheetHandle,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    ...type.screenTitle,
    color: colors.text,
  },
  closeBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -12,
  },
  option: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  optionLabel: {
    ...type.body,
    color: colors.text,
  },
  optionSelected: {
    fontFamily: type.bodyStrong.fontFamily,
    color: colors.link,
  },
  empty: {
    ...type.body,
    color: colors.textMuted,
    textAlign: 'center',
    paddingTop: 24,
  },
});

export default PickerSheet;
