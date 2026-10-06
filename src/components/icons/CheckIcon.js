import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme/colors';

const CheckIcon = ({color = theme.SUCCESS_COLOR, size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 20 20" fill="none">
    <Path
      d="M16.6667 5L7.50001 14.1667L3.33334 10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CheckIcon;
