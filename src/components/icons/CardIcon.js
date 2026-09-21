import React from 'react';
import Svg, {Path} from 'react-native-svg';

const CardIcon = ({color = '#0B0B0E', size = 24}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18.875 5H4.625C3.17525 5 2 6.17525 2 7.625V17.375C2 18.8247 3.17525 20 4.625 20H18.875C20.3247 20 21.5 18.8247 21.5 17.375V7.625C21.5 6.17525 20.3247 5 18.875 5Z"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2.25 9H21.75M6 14.0625H8.25V15H6V14.0625Z"
      stroke={color}
      strokeWidth={2.8125}
      strokeLinejoin="round"
    />
  </Svg>
);

export default CardIcon;
