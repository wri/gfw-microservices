import React from 'react';
import { checkValid } from '../../../../locations/js/utils/locationsTableUtils';

export const renderCell = (label) => (checkValid(label) ? <span>{label}</span> : '--');
