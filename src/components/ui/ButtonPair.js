import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Button} from './PrimaryButton';

/**
 * Secondary + primary buttons side by side (status screens, confirm sheets).
 *
 * Props:
 *   secondary  {title, onPress, disabled}
 *   primary    {title, onPress, disabled, loading, variant ('primary' | 'danger')}
 */
const ButtonPair = ({secondary, primary}) => (
  <View style={styles.row}>
    <View style={styles.cell}>
      <Button variant="secondary" size="pair" {...secondary} />
    </View>
    <View style={styles.cell}>
      <Button variant="primary" size="pair" {...primary} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  cell: {
    flex: 1,
  },
});

export default ButtonPair;
