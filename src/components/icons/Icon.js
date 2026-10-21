import React from 'react';
import Svg, {Path, Circle, Rect} from 'react-native-svg';
import {colors} from '../../theme/tokens';

// Stroke icons from the redesign specs (24×24 viewBox). Each entry is a list of
// shapes: a string is a path, objects are circles / rects.
const ICONS = {
  // Navigation
  back: ['m15 6-6 6 6 6'],
  chevronRight: ['m9 6 6 6-6 6'],
  chevronDown: ['m6 9 6 6 6-6'],
  close: ['M6 6l12 12M18 6 6 18'],

  // Customer tabs
  home: ['M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z'],
  explore: [{circle: {cx: 12, cy: 12, r: 9}}, 'm15.5 8.5-2 5-5 2 2-5z'],
  rewards: [
    {rect: {x: 3, y: 8, width: 18, height: 4, rx: 1}},
    'M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5',
  ],
  wallet: ['M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6', 'M16.5 13.5h.01'],
  profile: [{circle: {cx: 12, cy: 8, r: 4}}, 'M4 21a8 8 0 0 1 16 0'],

  // Merchant tabs
  overview: ['M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z'],
  programs: ['M4 6h16M4 12h16M4 18h10'],
  customers: ['M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0M16 3.5a4 4 0 0 1 0 7M22 21a7 7 0 0 0-4-6.3'],
  activity: ['M3 12h4l3 8 4-16 3 8h4'],
  business: ['M3 9 4.5 4h15L21 9M3 9v11h18V9M3 9h18M9 20v-6h6v6'],

  // Actions
  card: [{rect: {x: 3, y: 6, width: 18, height: 13, rx: 3}}, 'M3 10h18M7 15h3'],
  send: ['M7 17 17 7M8 7h9v9'],
  receive: ['M17 7 7 17M16 17H7V8'],
  plus: ['M12 5v14M5 12h14'],
  copy: [{rect: {x: 8, y: 8, width: 12, height: 12, rx: 2}}, 'M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3'],
  search: [{circle: {cx: 11, cy: 11, r: 7}}, 'm20 20-3.5-3.5'],
  heart: ['M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 12 5.5 5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z'],
  lock: [{rect: {x: 5, y: 11, width: 14, height: 10, rx: 2}}, 'M8 11V7a4 4 0 0 1 8 0v4'],
  shield: ['M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z', 'M12 8v5M12 16h.01'],
  bank: ['M3 10h18L12 4zM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18'],
  receipt: ['M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6'],
  ticket: ['M3 7h18v3a2 2 0 0 0 0 4v3H3v-3a2 2 0 0 0 0-4zM14 7v10'],
  star: ['M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z'],
  reverse: ['M9 14 4 9l5-5M4 9h11a5 5 0 0 1 0 10h-3'],
  newProgram: ['M4 6h16M4 12h10M4 18h7M18 15v6M15 18h6'],
  mail: ['M3 6h18v12H3zM3 7l9 6 9-6'],
  phone: ['M7 3h10v18H7zM11 18h2'],
  idCard: ['M4 5h16v14H4zM8 10h4M8 14h8'],
  trash: ['M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13'],
  alert: [{circle: {cx: 12, cy: 12, r: 9}}, 'M12 8v5M12 16h.01'],

  // Status
  check: ['m5 12 5 5 9-10'],
  dot: [{circle: {cx: 12, cy: 12, r: 6}}],
  sync: ['M3 12a9 9 0 0 1 15-6.7L21 3M21 12a9 9 0 0 1-15 6.7L3 21'],
  pending: ['M6 3h12M6 21h12M7 3c0 5 10 5 10 9s-10 4-10 9M17 3c0 5-10 5-10 9s10 4 10 9'],
  failed: ['M6 6l12 12M18 6 6 18'],
};

/**
 * Props:
 *   name        key of ICONS
 *   size        number (default 22)
 *   color       stroke colour (default colors.text)
 *   strokeWidth number (default 1.8)
 *   fill        fill colour, e.g. a filled heart (default 'none')
 */
const Icon = ({name, size = 22, color = colors.text, strokeWidth = 1.8, fill = 'none'}) => {
  const shapes = ICONS[name];
  if (!shapes) {
    return null;
  }
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {shapes.map((shape, i) => {
        if (typeof shape === 'string') {
          return <Path key={i} d={shape} />;
        }
        if (shape.circle) {
          return <Circle key={i} {...shape.circle} />;
        }
        return <Rect key={i} {...shape.rect} />;
      })}
    </Svg>
  );
};

export default Icon;
