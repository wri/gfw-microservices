import { useState } from 'react';
import { Alert } from '@mui/material';
import GHGIcon from '../../../../../common/images/CO2.svg';

function GHGBanner() {
  const [isGHGBannerDisplayed, setIsGHGBannerDisplayed] = useState(true);

  return (
    <>
      {isGHGBannerDisplayed && (
        <Alert
          icon={<img src={GHGIcon} alt="GHG icon" style={{ height: '24px', width: '24px' }} />}
          sx={{
            mt: 4,
            backgroundColor: 'rgba(151, 189, 61, 0.2)',
            border: '1px solid rgba(151, 189, 61, 1)',
          }}
          severity="success"
          onClose={() => setIsGHGBannerDisplayed(false)}
        >
          This list has <b>Greenhouse Gas Emissions</b> analysis applied, accessible only via the
          GFW Pro Commercial API. To view or manage this analysis, please use the API.
        </Alert>
      )}
    </>
  );
}

export default GHGBanner;
