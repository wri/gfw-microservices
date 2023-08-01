import React from 'react';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const fontStyles = {
  fontFamily: 'Fira Sans, sans-serif',
  textTransform: 'uppercase',
  color: '#555555',
};

export default function SettingSection({
  heading,
  subHeading,
  children,
  hiddenDivider: isDividerHidden,
}) {
  return (
    <>
      {isDividerHidden !== undefined ? null : <Divider sx={{ margin: '1.5rem 0' }} />}
      <Grid container>
        <Grid
          item
          xs={12}
          sm={3}
          sx={{
            marginBottom: {
              xs: '1.5rem',
            },
          }}
        >
          {heading && (
            <Typography sx={{...fontStyles, fontWeight: 500}} variant="subtitle1">
              {heading}
            </Typography>
          )}
          {subHeading && (
            <Typography sx={fontStyles} variant="body1">
              {subHeading}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={9}>
          {children}
        </Grid>
      </Grid>
    </>
  );
}
