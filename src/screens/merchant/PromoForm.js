import React, {useState} from 'react';
import {View, Text, Switch, StyleSheet} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {showMessage} from 'react-native-flash-message';
import FormLayout from '../../components/layout/FormLayout';
import {AppInput, PrimaryButton, TextArea} from '../../components/ui';
import {merchantAPI} from '../../services/api';
import {useMerchantId, isPromoActive, PROMO_ACTIVE, PROMO_INACTIVE} from '../../utilities/merchantData';
import {colors, type, radii} from '../../theme/tokens';

/**
 * Create or edit a promotion. Params: {promo?}
 * Not in the design files; built from the shared form components.
 */
const PromoForm = () => {
  const navigation = useNavigation();
  const merchantId = useMerchantId();
  const promo = useRoute().params?.promo;

  const [title, setTitle] = useState(promo?.title || promo?.name || '');
  const [description, setDescription] = useState(promo?.description || '');
  const [active, setActive] = useState(promo ? isPromoActive(promo) : true);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setError('');
    const body = {
      title: title.trim(),
      description: description.trim(),
      status: active ? PROMO_ACTIVE : PROMO_INACTIVE,
    };
    try {
      if (promo) {
        await merchantAPI.updatePromo(merchantId, promo.id, body);
      } else {
        await merchantAPI.createPromo(merchantId, body);
      }
      showMessage({message: promo ? 'Promotion updated' : 'Promotion created', type: 'success'});
      navigation.goBack();
    } catch (err) {
      setError(err.message || "The promotion couldn't be saved.");
    }
  };

  return (
    <FormLayout
      title={promo ? 'Edit promotion' : 'New promotion'}
      onBack={() => navigation.goBack()}
      contentStyle={styles.content}
      footer={
        <>
          {!!error && (
            <Text style={styles.error} accessibilityRole="alert">
              {error}
            </Text>
          )}
          <PrimaryButton title={promo ? 'Save changes' : 'Create promotion'} onPress={handleSave} disabled={!title.trim()} />
        </>
      }>
      <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="e.g. Double points weekend" maxLength={60} />
      <TextArea
        label="Short description"
        value={description}
        onChangeText={setDescription}
        placeholder="e.g. Earn 2× on every order, Sat–Sun"
        maxLength={140}
      />
      <View style={styles.switchRow}>
        <View style={styles.switchText}>
          <Text style={styles.switchTitle}>Active</Text>
          <Text style={styles.switchSub}>Active promotions show on Explore</Text>
        </View>
        <Switch
          value={active}
          onValueChange={setActive}
          trackColor={{false: colors.surfaceRaised, true: colors.primary}}
          thumbColor={colors.white}
          ios_backgroundColor={colors.surfaceRaised}
          accessibilityLabel="Active"
        />
      </View>
    </FormLayout>
  );
};

const styles = StyleSheet.create({
  content: {
    gap: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  switchText: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    ...type.bodyStrong,
    color: colors.text,
  },
  switchSub: {
    ...type.caption,
    color: colors.textMuted,
  },
  error: {
    ...type.captionStrong,
    fontSize: 12,
    color: colors.danger,
    textAlign: 'center',
  },
});

export default PromoForm;
