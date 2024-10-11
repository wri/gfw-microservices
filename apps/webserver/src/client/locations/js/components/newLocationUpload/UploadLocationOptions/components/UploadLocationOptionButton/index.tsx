import React from 'react';

import './index.scss';
import { UploadLocationOptionButtonProps } from './types';

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
