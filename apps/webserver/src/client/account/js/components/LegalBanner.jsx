import React from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@mui/material/CardContent';
import { licenseAgreement, priceSheet } from '../../../common/js/config';

export default function LegalBanner() {
  return (
    <Card style={{marginTop: '29px'}}>
      <CardContent>
        <p>
          GFW Pro offers a significant annual grant of free annual usage that may be shared across
          entities in the same organization or enterprise.​
        </p>
        <p>
          Usage beyond that annual grant or external sharing of output analyses with other
          organizations requires purchase of additional usage or licenses.​
        </p>
        <p>
          For more information, please consult the{' '}
          <a href={priceSheet} className="gfw-green" target="_blank">
            Price Sheet
          </a>{' '}
          and{' '}
          <a href={licenseAgreement} className="gfw-green" target="_blank">
            License Agreement
          </a>
        </p>
      </CardContent>
    </Card>
  );
}
