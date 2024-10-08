import React from 'react';
import { SvgIconProps } from '@mui/material/SvgIcon/SvgIcon';

export interface RectangleButtonWithIconProps {
  Icon: React.ElementType<SvgIconProps>;
  text: string;
  onClick: () => void;
}
