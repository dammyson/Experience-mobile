import React from 'react';
import Svg, {Path} from 'react-native-svg';
import {theme} from '../../theme/colors';

const CloseIcon = ({color = theme.TEXT_SECONDARY, size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 6L6 18M6 6l12 12"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default CloseIcon;
