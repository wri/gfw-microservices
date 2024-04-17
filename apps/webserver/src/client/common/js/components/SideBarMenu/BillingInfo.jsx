import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import './SideBarMenu.scss';

function BillingInfo() {
  return (
    <Card variant="outlined" style={{ marginTop: '20px' }}>
      <CardContent>
        <p style={{ textAlign: 'center' }}>
          Contact our sales team to purchase additional Usage units or other available services
        </p>
        <a className="gfw-button btn-green btn-width-full" href="mailto:youremail@example.com">
          Email Sales
        </a>
        <a
          className="side-bar-link"
          href="https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-price-sheet/"
        >
          Price List
        </a>
        <a
          className="side-bar-link"
          href="https://www.globalforestwatch.org/help/gfw-pro/faq-fee-model/"
        >
          Fee Model FAQ
        </a>
      </CardContent>
    </Card>
  );
}

export default BillingInfo;
