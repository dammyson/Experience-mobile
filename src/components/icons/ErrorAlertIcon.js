import React from 'react';
import Svg, {Path, Circle} from 'react-native-svg';
import {theme} from '../../theme/colors';

const ErrorAlertIcon = ({color = theme.ERROR_COLOR, size = 32}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={2} />
    <Path
      d="M12 8v4"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Circle cx="12" cy="16" r="1" fill={color} />
  </Svg>
);

export default ErrorAlertIcon;
