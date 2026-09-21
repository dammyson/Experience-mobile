import React from 'react';
import Svg, {Path} from 'react-native-svg';

const TopUpIcon = ({color = '#F2F2F2', size = 32}) => (
  <Svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <Path
      d="M25.0667 26.9333V18.9333M22.4 21.6L25.0667 18.9333L27.7333 21.6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M29.0667 16.2666C29.0667 11.2386 29.0667 8.72398 27.504 7.16264C25.9413 5.60131 23.428 5.59998 18.4 5.59998H13.0667C8.03866 5.59998 5.52399 5.59998 3.96266 7.16264C2.40133 8.72531 2.39999 11.2386 2.39999 16.2666C2.39999 21.2946 2.39999 23.8093 3.96266 25.3706C5.52533 26.932 8.03866 26.9333 13.0667 26.9333H18.4M13.0667 21.6H7.73333M17.0667 21.6H16.4M2.39999 13.6H29.0667"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
  </Svg>
);

export default TopUpIcon;
