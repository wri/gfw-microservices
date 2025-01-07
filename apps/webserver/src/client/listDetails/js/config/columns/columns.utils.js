import React from 'react';
import { checkValid } from '../../../../locations/js/utils/locationsTableUtils';

const sanitizeLabel = (label) => label.replace(/\s+/g, '-');
export const renderCell = (label) =>
  checkValid(label) ? <span data-cy={`cell-${sanitizeLabel(label)}`}>{label}</span> : '--';
