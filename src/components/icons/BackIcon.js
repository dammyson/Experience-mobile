import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme/colors';

const BackIcon = ({color = theme.TEXT_PRIMARY, size = 32}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M18.6667 9.33331L12.0001 16L18.6667 22.6666"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default BackIcon;
