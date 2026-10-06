import React from 'react';
import Svg, {Path} from 'react-native-svg';

const FlagIcon = ({color = '#E53935', size = 20}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 15S5 14 8 14C11 14 13 16 16 16C19 16 20 15 20 15V3C20 3 19 4 16 4C13 4 11 2 8 2C5 2 4 3 4 3V15ZM4 15V22"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default FlagIcon;
