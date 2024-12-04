import React from 'react';
import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Close } from '@mui/icons-material';

import { useHistory } from '../hooks';
import { PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';

export function ConfigureList() {
  const theme = useTheme();
  const history = useHistory();
  const { clearUploadType } = useUploadLocation();

  return (
    <>
      <NavBar />
      <Card component="form" sx={{ pt: 1, px: 2, pb: 2 }}>
        <Typography variant="h6">Configure List</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mb: 3, color: theme.palette.text.secondary }}
        >
          Define your data's commodity, whether you wish to create a new list or add it to an
          existing one, and the analysis you would like applied to your upload.
        </Typography>
        <Typography variant="subtitle2">Commodity *</Typography>
        <Select sx={{ width: '240px' }} size="small">
          <MenuItem value="cattle">Cattle</MenuItem>
          <MenuItem value="cocoa">Cocoa</MenuItem>
          <MenuItem value="coffee">Coffee</MenuItem>
          <MenuItem value="palm-oil">Palm oil</MenuItem>
          <MenuItem value="pulp-and-paper">Pulp and paper</MenuItem>
          <MenuItem value="rubber">Rubber</MenuItem>
          <MenuItem value="soy">Soy</MenuItem>
          <MenuItem value="sugar-cane">Sugar cane</MenuItem>
          <MenuItem value="multiple">Multiple</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </Select>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2">Define List *</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mb: 4, color: theme.palette.text.secondary }}
        >
          Create a new list for your data, or add it to an existing list. Note that you can only add
          to lists that match the commodity you have defined above.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <TextField size="small" sx={{ flex: '1' }} placeholder="Name your new list" />
          <Typography>or</Typography>
          <Select sx={{ flex: '1' }} size="small">
            <MenuItem value="palm-oil">Add to an existing list</MenuItem>
          </Select>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle2">Type of analysis *</Typography>
        <Typography variant="caption" color={theme.palette.text.secondary}>
          Select the analysis you would like applied to your data. Note that each analysis selected
          counts towards your account usage limits. See more information here.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <FormControlLabel
            control={<Checkbox sx={{ py: 0 }} />}
            sx={{ textTransform: 'none' }}
            label={
              <Box sx={{ lineHeight: 0 }}>
                <Typography variant="body2">Post-2000 Forest Change</Typography>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                  Post-2000 annual tree cover loss + additional contextual and regional datasets
                </Typography>
              </Box>
            }
          ></FormControlLabel>
          <FormControlLabel
            control={<Checkbox sx={{ py: 0 }} />}
            sx={{ textTransform: 'none', ml: 2 }}
            label={
              <Box sx={{ lineHeight: 0 }}>
                <Typography variant="body2">Include Palm Risk Assessment</Typography>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                  Commodity-specific risk analysis for palm oil mills
                </Typography>
              </Box>
            }
          ></FormControlLabel>

          <FormControlLabel
            control={<Checkbox sx={{ py: 0 }} />}
            sx={{ textTransform: 'none' }}
            label={
              <Box sx={{ lineHeight: 0 }}>
                <Typography variant="body2">Recent Deforestation Alerts</Typography>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                  Recent deforestation alerts, updated weekly
                </Typography>
              </Box>
            }
          ></FormControlLabel>
          <FormControlLabel
            control={<Checkbox sx={{ py: 0 }} />}
            sx={{ textTransform: 'none' }}
            label={
              <Box sx={{ lineHeight: 0 }}>
                <Typography variant="body2">Post-2020 Risk Assessment</Typography>
                <Typography variant="caption" color={theme.palette.text.secondary}>
                  Post-2020 deforestation in natural forest + additional contextual datasets
                </Typography>
              </Box>
            }
          ></FormControlLabel>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row', xs: 'column' },
            justifyContent: 'end',
            gap: 1,
            mt: 4,
          }}
        >
          <PillButton
            variant="contained"
            color="info"
            startIcon={<ArrowBackIos />}
            onClick={() => history.goBack()}
            sx={{ mr: 'auto' }}
          >
            Back
          </PillButton>

          <PillButton
            variant="contained"
            color="info"
            startIcon={<Close />}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton disabled type="submit" variant="contained" startIcon={<ArrowForwardIos />}>
            Next
          </PillButton>
        </Box>
      </Card>
    </>
  );
}
