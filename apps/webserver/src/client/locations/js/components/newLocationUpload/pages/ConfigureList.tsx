import React from 'react';
import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useHistory } from '../hooks';
import { PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { UserList } from '../types';

const schema = z.object({
  commodity: z.string().trim().min(1),
  newListName: z.string().trim().min(1),
  existingListName: z.string().trim().min(1),
  post2000ForestChange: z.boolean(),
  includePalmRiskAssessment: z.boolean(),
  recentDeforestationAlerts: z.boolean(),
  post2000RiskAssessment: z.boolean(),
});

type FormFields = z.infer<typeof schema>;

export function ConfigureList({ userLists }: { userLists: UserList[] }) {
  const theme = useTheme();
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormFields>({ resolver: zodResolver(schema) });
  const { clearUploadType } = useUploadLocation();

  const onSubmit = (data: FormFields) => {
    console.log({ data });
  };

  return (
    <>
      <NavBar />
      <Card component="form" sx={{ pt: 1, px: 2, pb: 2 }} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Configure List</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mb: 3, color: theme.palette.text.secondary }}
        >
          Define your data's commodity, whether you wish to create a new list or add it to an
          existing one, and the analysis you would like applied to your upload.
        </Typography>
        <Typography variant="subtitle2">Commodity *</Typography>
        <Controller
          name="commodity"
          control={control}
          render={({ field }) => (
            <>
              <Select sx={{ width: '240px' }} size="small" {...field}>
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
              {!!errors.commodity && (
                <FormHelperText sx={{ color: theme.palette.error.main, mx: 1.75 }}>
                  Enter the commodity
                </FormHelperText>
              )}
            </>
          )}
        />

        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2">Define List *</Typography>
        <Typography
          variant="caption"
          sx={{ display: 'inline-block', mb: 4, color: theme.palette.text.secondary }}
        >
          Create a new list for your data, or add it to an existing list. Note that you can only add
          to lists that match the commodity you have defined above.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 3 }}>
          <Controller
            name="newListName"
            control={control}
            defaultValue=""
            render={({ field }) => (
              <TextField
                size="small"
                sx={{ flex: '1' }}
                placeholder="Name your new list"
                error={!!errors.newListName}
                helperText={errors.newListName ? 'Enter the list name' : ''}
                {...field}
              />
            )}
          />

          <Typography sx={{ mt: 1 }}>or</Typography>

          <Controller
            name="existingListName"
            control={control}
            render={({ field }) => (
              <Select sx={{ flex: '1' }} size="small" {...field}>
                {userLists.map(({ id, list_name }) => (
                  <MenuItem key={id} value={id}>
                    {list_name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
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
          <PillButton type="submit" variant="contained" startIcon={<ArrowForwardIos />}>
            Next
          </PillButton>
        </Box>
      </Card>
    </>
  );
}
