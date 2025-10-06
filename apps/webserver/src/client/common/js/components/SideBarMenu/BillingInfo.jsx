import { Card, CardContent } from '@mui/material';
import './SideBarMenu.scss';

import { PillButton, Link } from '../../../../components';

function BillingInfo() {
  return (
    <Card variant="outlined" sx={{ mt: 2.5 }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <p style={{ textAlign: 'center' }}>
          Contact our sales team to purchase additional usage units or other available services.
        </p>
        <PillButton
          variant="contained"
          size="small"
          fullWidth
          sx={{ mb: 2 }}
          href="https://gfwpro.zendesk.com/hc/en-us/requests/new"
        >
          Support Form
        </PillButton>
        <Link
          target="_blank"
          href="https://www.globalforestwatch.org/help/guides/global-forest-watch-pro-price-sheet/"
        >
          Price List
        </Link>
        <Link
          target="_blank"
          href="https://www.globalforestwatch.org/help/gfw-pro/faq-subscription-fee-model-faq/"
        >
          Fee Model FAQ
        </Link>
      </CardContent>
    </Card>
  );
}

export default BillingInfo;
