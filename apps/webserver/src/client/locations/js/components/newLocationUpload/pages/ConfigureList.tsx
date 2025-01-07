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
  SelectChangeEvent,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Close } from '@mui/icons-material';
import { useForm, Controller, FieldError } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useHistory } from '../hooks';
import { PillButton } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { UserList } from '../types';
import { filterValidTemplates } from '../utils/filterValidTemplates';
import { typeOfAnalysisMap } from '../utils/constants';

const schema = z
  .object({
    commodity: z.string().trim().min(1),
    newListName: z
      .string()
      .trim()
      .regex(/^[a-zA-Z0-9 ]*$/, 'Only letters, numbers, and spaces are allowed'),
    existingListName: z.string(),
    FCD: z.coerce.boolean(),
    palmRiskAssessment: z.coerce.boolean(),
    ALERTS: z.coerce.boolean(),
    AFI: z.coerce.boolean(),
    customCommodity: z.string().optional(),
  })
  .refine((data) => data.newListName !== '' || data.existingListName !== '', {
    message: 'You must provide at least one list name.',
    path: ['noListNameProvided'],
  })
  .refine((data) => !(data.commodity === 'other' && data.customCommodity === ''), {
    path: ['customCommodity'],
  });

type FormFields = z.infer<typeof schema>;

export function ConfigureList({ userLists }: { userLists: UserList[] }) {
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
    getValues,
    setValue,
    reset,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      commodity: '',
      newListName: '',
      existingListName: '',
      palmRiskAssessment: false,
      FCD: false,
      ALERTS: false,
      AFI: false,
      customCommodity: '',
    },
  });
  const { clearUploadType, setUploadLocationConfigureList } = useUploadLocation();

  const [formFields, setFormFields] = useState<{
    newListName: string;
    existingListName: string;
  }>({
    newListName: '',
    existingListName: '',
  });

  const handleChangeExistingListName = (
    e: SelectChangeEvent<string>,
    field: {
      onChange: (value: string) => void;
    }
  ) => {
    const value = e.target.value || '';
    setFormFields((v) => ({ ...v, existingListName: value }));
    field.onChange(value);

    const template = userLists.find((list) => list.list_name === value);

    typeOfAnalysisMap.forEach((typeOfAnalysis) => {
      const found = template?.listAnalysesStatus.find((x) => x.analysisId === typeOfAnalysis.id);
      setValue(typeOfAnalysis.id as keyof FormFields, !!found);
    });
  };

  const handleAnalysisChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: boolean) => void;
    },
    id: string
  ) => {
    field.onChange(e.target.checked);

    if (id === 'palmRiskAssessment' && e.target.checked) {
      setValue('FCD', true);
    } else if (id === 'FCD' && !e.target.checked) {
      setValue('palmRiskAssessment', false);
    }
  };

  const onSubmit = (data: FormFields) => {
    setUploadLocationConfigureList({
      commodity: data.commodity,
      newListName: data.newListName ?? '',
      existingListName: data.existingListName ?? '',
      typeOfAnalysis: {
        palmRiskAssessment: data.palmRiskAssessment,
        FCD: data.FCD,
        AFI: data.AFI,
        ALERTS: data.ALERTS,
      },
    });
    history.push('SUMMARY_AND_SUBMIT');
  };

  const chosenCommodity = getValues('commodity');
  const templateType = templateTypes[chosenCommodity];

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

        <Box sx={{ display: 'flex' }}>
          <Box sx={{ display: 'flex', gap: 0.75, mr: 1, mt: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
              Commodity
            </Typography>
            <Typography variant="subtitle2" color="error.main">
              *
            </Typography>
          </Box>
          <Controller
            name="commodity"
            control={control}
            render={({ field }) => (
              <FormControl error={!!errors.commodity}>
                <Select
                  sx={{ width: '240px' }}
                  size="small"
                  value={field.value || ''}
                  onChange={(e) => {
                    const value = e.target.value || '';
                    reset({ commodity: value });
                    setFormFields((v) => ({ ...v, existingListName: '' }));
                    field.onChange(value);
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
          {chosenCommodity === 'other' && (
            <>
              <Box sx={{ display: 'flex', gap: 0.75, ml: 3, mr: 1, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
                  Custom commodity
                </Typography>
                <Typography variant="subtitle2" color="error.main">
                  *
                </Typography>
              </Box>

              <Controller
                name="customCommodity"
                control={control}
                render={({ field }) => {
                  return (
                    <TextField
                      size="small"
                      sx={{ flex: '1' }}
                      error={!!errors.customCommodity}
                      helperText={errors.customCommodity ? 'Enter custom commodity' : ''}
                      {...field}
                    />
                  );
                }}
              />
            </>
          )}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
            Define List
          </Typography>
          <Typography variant="subtitle2" color="error.main">
            *
          </Typography>
        </Box>

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
            render={({ field }) => {
              const error =
                ('noListNameProvided' in errors && (errors.noListNameProvided as FieldError)) ||
                errors.newListName;

              return (
                <TextField
                  size="small"
                  disabled={!!formFields.existingListName}
                  sx={{ flex: '1' }}
                  placeholder="Name your new list"
                  error={!!error}
                  helperText={error ? error.message ?? 'Enter the list name' : ''}
                  value={formFields.newListName}
                  onChange={(e) => {
                    const value = e.target.value || '';
                    setFormFields((v) => ({ ...v, newListName: value }));
                    field.onChange(value);
                  }}
                />
              );
            }}
          />

          <Typography sx={{ mt: 1 }}>or</Typography>

          <Controller
            name="existingListName"
            control={control}
            render={({ field }) => {
              const error =
                ('noListNameProvided' in errors && (errors.noListNameProvided as FieldError)) ||
                errors.existingListName;

              return (
                <FormControl error={!!error} sx={{ flex: '1' }}>
                  <Select
                    disabled={validLists.length === 0 || !!formFields.newListName}
                    size="small"
                    value={formFields.existingListName}
                    onChange={(e) => handleChangeExistingListName(e, field)}
                  >
                    {validLists.map(({ id, list_name }) => (
                      <MenuItem key={id} value={list_name}>
                        {list_name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!error && (
                    <FormHelperText>{error.message ?? 'Enter the list name'}</FormHelperText>
                  )}
                </FormControl>
              );
            }}
          />
        </Box>
        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: '500' }}>
            Type of analysis
          </Typography>
          <Typography variant="subtitle2" color="error.main">
            *
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          Select the analysis you would like applied to your data. Note that each analysis selected
          counts towards your account usage limits. See more information here.
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 1 }}>
          {typeOfAnalysisMap
            .filter((x) => chosenCommodity === 'palm-oil' || x.id !== 'palmRiskAssessment')
            .map(({ id, label, description }) => {
              const isPalmRisk = id === 'palmRiskAssessment';
              return (
                <Controller
                  key={id}
                  name={id as keyof FormFields}
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      control={
                        <Checkbox
                          sx={{ py: 0 }}
                          checked={!!field.value}
                          onChange={(e) => handleAnalysisChange(e, field, id)}
                          inputRef={field.ref}
                        />
                      }
                      sx={{ textTransform: 'none', ml: isPalmRisk ? 2 : 0 }}
                      label={
                        <Box sx={{ lineHeight: 0 }}>
                          <Typography variant="body2">{label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {description}
                          </Typography>
                        </Box>
                      }
                    ></FormControlLabel>
                  )}
                />
              );
            })}
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
