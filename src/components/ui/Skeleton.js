import React, {useEffect, useRef} from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import {colors, radii} from '../../theme/tokens';

/**
 * Pulsing placeholder block.
 *
 * Props:
 *   width, height, radius, style
 */
export const Skeleton = ({width = '100%', height = 14, radius = 6, style}) => {
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {toValue: 1, duration: 700, useNativeDriver: true}),
        Animated.timing(opacity, {toValue: 0.5, duration: 700, useNativeDriver: true}),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity}, style]}
    />
  );
};

/** Matches ActivityRow (card variant) */
export const SkeletonRow = () => (
  <View style={styles.row}>
    <Skeleton width={34} height={34} radius={10} />
    <View style={styles.middle}>
      <Skeleton width="60%" height={13} />
      <Skeleton width="40%" height={11} />
    </View>
    <Skeleton width={64} height={13} />
  </View>
);

/** Matches BalanceCard */
export const SkeletonCard = ({height = 140}) => <Skeleton height={height} radius={radii.balance} />;

/**
 * Stack of skeleton rows, shown while a list loads.
 *
 * Props:
 *   rows   number (default 4)
 */
const SkeletonList = ({rows = 4}) => (
  <View style={styles.list} accessible accessibilityLabel="Loading" accessibilityState={{busy: true}}>
    {Array.from({length: rows}, (_, i) => (
      <SkeletonRow key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: radii.cta,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderCard,
  },
  middle: {
    flex: 1,
    gap: 6,
  },
});

export default SkeletonList;
