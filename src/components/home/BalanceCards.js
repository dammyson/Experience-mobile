import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {theme} from '../../theme/colors';

const BalanceCards = ({
  points = '1750',
  estimatedValue = '950',
  currency = '₦',
}) => (
  <View style={styles.container}>
    {/* Current Balance Card - Gradient */}
    <View style={styles.cardWrapper}>
      <LinearGradient
        colors={['#885DF5', '#6B7CFE']}
        start={{x: 0, y: 0.5}}
        end={{x: 1, y: 0}}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>Points</Text>
        <Text style={styles.cardPoints}>{points}</Text>
        <Text style={styles.cardSubLabel}>Current Balance</Text>
      </View>
    </View>

    {/* Est. Point Value Card - Solid */}
    <View style={styles.cardSolid}>
      <View style={styles.cardContent}>
        <Text style={styles.cardLabel}>Est. Point Value</Text>
        <Text style={styles.cardPoints}>
          {currency}
          {estimatedValue}
        </Text>
        <Text style={styles.cardSubLabel}>Available to Redeem</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 14,
    marginTop: 8,
  },
  cardWrapper: {
    flex: 1,
    height: 140,
    borderRadius: 23,
    padding: 14,
    overflow: 'hidden',
  },
  cardSolid: {
    flex: 1,
    height: 140,
    borderRadius: 23,
    padding: 14,
    backgroundColor: '#380E7A',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: theme.WHITE,
  },
  cardPoints: {
    fontFamily: 'Inter-Bold',
    fontSize: 35,
    lineHeight: 42,
    letterSpacing: -1,
    color: theme.WHITE,
  },
  cardSubLabel: {
    fontFamily: 'Inter-ExtraLight',
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.5,
    color: theme.WHITE,
  },
});

export default BalanceCards;
