import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg, {Ellipse, Defs, Filter, FeFlood, FeBlend, FeGaussianBlur} from 'react-native-svg';
import {theme} from '../../theme/colors';

/**
 * Shared background for all app screens.
 * Renders the #0B0B0E base + the Brand/br300 glow ellipse (top-right)
 * extracted directly from Figma node 1:7626.
 */
const ScreenBackground = ({children, style}) => (
  <View style={[styles.root, style]}>
    <Svg
      width={365}
      height={329}
      viewBox="0 0 365 329"
      style={styles.glow}
      pointerEvents="none">
      <Defs>
        <Filter
          id="glow"
          x="0"
          y="-214.339"
          width="600.915"
          height="542.925"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB">
          <FeFlood floodOpacity={0} result="BackgroundImageFix" />
          <FeBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <FeGaussianBlur stdDeviation={68} result="effect1_foregroundBlur" />
        </Filter>
      </Defs>
      <Ellipse
        cx={300.457}
        cy={57.1238}
        rx={206.869}
        ry={50.8109}
        transform="rotate(-38.7559 300.457 57.1238)"
        fill={theme.PRIMARY_DARK}
        filter="url(#glow)"
      />
    </Svg>
    {children}
  </View>
);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.BACKGROUND_COLOR,
  },
  glow: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
});

export default ScreenBackground;
