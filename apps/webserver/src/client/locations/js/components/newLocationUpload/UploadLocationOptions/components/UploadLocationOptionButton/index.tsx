import React from 'react';
import './index.scss';

import { SvgIconProps } from '@mui/material/SvgIcon/SvgIcon';

type UploadLocationOptionButtonProps = {
  Icon: React.ElementType<SvgIconProps>;
  text: string;
  onClick: () => void;
};

export function UploadLocationOptionButton({
  Icon,
  text,
  onClick,
}: UploadLocationOptionButtonProps) {
  return (
    <button className="upload-location-option-button" onClick={onClick}>
      <Icon />
      <span>{text}</span>
    </button>
  );
}
