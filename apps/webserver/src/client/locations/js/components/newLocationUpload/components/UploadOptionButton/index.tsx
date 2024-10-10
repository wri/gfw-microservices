import React from 'react';

import './index.scss';
import { UploadOptionButtonProps } from './types';

export function UploadOptionButton({ Icon, text, onClick }: UploadOptionButtonProps) {
  return (
    <button className="rectangle-button-with-icon-props" onClick={onClick}>
      <Icon />
      <span>{text}</span>
    </button>
  );
}
