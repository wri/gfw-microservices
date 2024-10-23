import React from 'react';
import './index.scss';

import { Button, ButtonProps } from '@mui/material';

export function PillButton({ children, ...props }: ButtonProps) {
  return (
    <Button className="pill-button" variant="contained" disableRipple {...props}>
      {children}
    </Button>
  );
}
