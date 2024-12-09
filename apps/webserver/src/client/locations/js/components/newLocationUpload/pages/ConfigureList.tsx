import React, { useState } from 'react';
import {
  Box,
  Card,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
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
import { filterValidTemplates } from '../utils/filterValidTemplates';

const schema = z
  .object({
    commodity: z.string().trim().min(1),
    newListName: z.string().trim().min(1).nullable(),
    existingListName: z.string().nullable(),
    post2000ForestChange: z.coerce.boolean(),
    includePalmRiskAssessment: z.coerce.boolean(),
    recentDeforestationAlerts: z.coerce.boolean(),
    post2000RiskAssessment: z.coerce.boolean(),
  })
  .refine((data) => data.newListName || data.existingListName, {
    message: 'Either list name or existing list must be provided.',
    path: ['newListName', 'existingListName'],
  });

type FormFields = z.infer<typeof schema>;

export function ConfigureList({ userLists }: { userLists: UserList[] }) {
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      commodity: '',
      newListName: null,
      existingListName: null,
      includePalmRiskAssessment: false,
      post2000ForestChange: false,
      post2000RiskAssessment: false,
      recentDeforestationAlerts: false,
    },
  });
  const { clearUploadType, setUploadLocationConfigureList } = useUploadLocation();

  const [commodity, setCommodity] = useState<string>('');

  const onSubmit = (data: FormFields) => {
    console.log({ data });
    setUploadLocationConfigureList(data);
    history.push('SUMMARY_AND_SUBMIT');
  };

  const templateType = templateTypes[commodity];

  const validLists = templateType
    ? userLists.filter((list) => filterValidTemplates(list, templateType))
    : [];

  return (
    <>
      <NavBar />
      <Card component="form" sx={{ pt: 1, px: 2, pb: 2 }} onSubmit={handleSubmit(onSubmit)}>
        <Typography variant="h6">Configure List</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'inline-block', mb: 3 }}
        >
          Define your data's commodity, whether you wish to create a new list or add it to an
          existing one, and the analysis you would like applied to your upload.
        </Typography>
        <Typography variant="subtitle2">Commodity *</Typography>
        <Controller
          name="commodity"
          control={control}
          render={({ field }) => (
            <FormControl error={!!errors.commodity}>
              <Select
                sx={{ width: '240px' }}
                size="small"
                value={commodity}
                onChange={(e) => {
                  setCommodity(e.target.value);
                  field.onChange(e);
                }}
              >
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
              {!!errors.commodity && <FormHelperText>Enter the commodity</FormHelperText>}
            </FormControl>
          )}
        />

        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2">Define List *</Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'inline-block', mb: 4 }}
        >
          Create a new list for your data, or add it to an existing list. Note that you can only add
          to lists that match the commodity you have defined above.
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'start', gap: 3 }}>
          <Controller
            name="newListName"
            control={control}
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
              <Select disabled={validLists.length === 0} sx={{ flex: '1' }} size="small" {...field}>
                {validLists.map(({ id, list_name }) => (
                  <MenuItem key={id} value={list_name}>
                    {list_name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
        </Box>
        <Divider sx={{ my: 3 }} />
        <Typography variant="subtitle2">Type of analysis *</Typography>
        <Typography variant="caption" color="text.secondary">
          Select the analysis you would like applied to your data. Note that each analysis selected
          counts towards your account usage limits. See more information here.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          <Controller
            name="post2000ForestChange"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ py: 0 }}
                    checked={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                  />
                }
                sx={{ textTransform: 'none' }}
                label={
                  <Box sx={{ lineHeight: 0 }}>
                    <Typography variant="body2">Post-2000 Forest Change</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Post-2000 annual tree cover loss + additional contextual and regional datasets
                    </Typography>
                  </Box>
                }
              ></FormControlLabel>
            )}
          />

          <Controller
            name="includePalmRiskAssessment"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ py: 0 }}
                    checked={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                  />
                }
                sx={{ textTransform: 'none', ml: 2 }}
                label={
                  <Box sx={{ lineHeight: 0 }}>
                    <Typography variant="body2">Include Palm Risk Assessment</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Commodity-specific risk analysis for palm oil mills
                    </Typography>
                  </Box>
                }
              ></FormControlLabel>
            )}
          />
          <Controller
            name="recentDeforestationAlerts"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ py: 0 }}
                    checked={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                  />
                }
                sx={{ textTransform: 'none' }}
                label={
                  <Box sx={{ lineHeight: 0 }}>
                    <Typography variant="body2">Recent Deforestation Alerts</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Recent deforestation alerts, updated weekly
                    </Typography>
                  </Box>
                }
              ></FormControlLabel>
            )}
          />
          <Controller
            name="post2000RiskAssessment"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Checkbox
                    sx={{ py: 0 }}
                    checked={field.value}
                    onChange={field.onChange}
                    inputRef={field.ref}
                  />
                }
                sx={{ textTransform: 'none' }}
                label={
                  <Box sx={{ lineHeight: 0 }}>
                    <Typography variant="body2">Post-2020 Risk Assessment</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Post-2020 deforestation in natural forest + additional contextual datasets
                    </Typography>
                  </Box>
                }
              ></FormControlLabel>
            )}
          />
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

const templateTypes: Record<string, string[]> = {
  cattle: ['cattle', 'cattleGeneric'],
  cocoa: ['cocoa', 'cocoaGeneric'],
  coffee: ['coffee'], // new type
  'palm-oil': ['palmMill', 'palmPlantation', 'palmFarm', 'palmGeneric'],
  'pulp-and-paper': ['pulpGeneric'],
  rubber: ['rubberGeneric'],
  soy: ['soySilo', 'soyFarm', 'soyGeneric'],
  multiple: ['multiple'], // new type
  other: ['other'],
};
