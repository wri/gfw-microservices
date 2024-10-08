import React from 'react';

import './index.scss';
import { RectangleButtonWithIconProps } from './types';

export function RectangleButtonWithIcon({ Icon, text, onClick }: RectangleButtonWithIconProps) {
  return (
    <button className="rectangle-button-with-icon-props" onClick={onClick}>
      <Icon />
      <span>{text}</span>
    </button>
  );
}
