import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Skeleton,
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
import { typeOfAnalysisMap, commodities } from '../utils/constants';
import { useFetch } from '../../../../../hooks';
import debounce from 'lodash/debounce';
import { fetchListsByCommodity } from '../../../../../api';

type CommoditiesType = (typeof commodities)[keyof typeof commodities];
const commodityValues = Object.values(commodities) as [CommoditiesType, ...CommoditiesType[]];

// @userLists param will be deprecated when new endpoint for typeOfAnalysis is released
export function ConfigureList({ userLists }: { userLists: UserList[] }) {
  const schema = z
    .object({
      commodity: z.enum(commodityValues),
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
    .refine(
      (data) =>
        !(
          data.commodity === 'Other' &&
          (!data.customCommodity || data.customCommodity.trim() === '')
        ),
      {
        path: ['customCommodity'],
      }
    )
    .refine(
      (data) =>
        !userLists.some((list) => list.list_name.toLowerCase() === data.newListName.toLowerCase()),
      {
        message: 'This list name already exists',
        path: ['newListName'],
      }
    );

  type FormFields = z.infer<typeof schema>;
  const history = useHistory();
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    setError,
    reset,
    watch,
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      commodity: '' as CommoditiesType,
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
  const existingList = useRef<{ id: number; analysisIds: string[] }>({ id: 0, analysisIds: [] });

  const [formFields, setFormFields] = useState<{
    newListName: string;
    existingListName: string;
  }>({
    newListName: '',
    existingListName: '',
  });

  const { data: validLists = [], isLoading, request } = useFetch<{ id: number; name: string }[]>();

  const selectedCommodity = watch('commodity') as CommoditiesType;
  useEffect(() => {
    if (!selectedCommodity || selectedCommodity === 'Other') {
      return;
    }

    getListsByCommodity(selectedCommodity);
  }, [selectedCommodity]);

  const getListsByCommodity = (selectedCommodity: string) => {
    fetchListsByCommodity(request, selectedCommodity);
  };

  const debouncedGetListsByCommodity = useCallback(
    debounce((selectedCommodity: string) => {
      getListsByCommodity(selectedCommodity);
    }, 1000),
    []
  );

  const handleChangeExistingListName = (
    e: SelectChangeEvent<string>,
    field: {
      onChange: (value: string) => void;
    }
  ) => {
    if (validLists === null) {
      return;
    }
    const value = e.target.value || '';
    setFormFields((v) => ({ ...v, existingListName: value }));
    field.onChange(value);

    const template = userLists.find((list) => list.list_name === value);
    if (template?.id) {
      existingList.current = {
        id: template.id,
        analysisIds: template?.listAnalysesStatus.map((x) => x.analysisId) || [],
      };
      typeOfAnalysisMap.forEach((typeOfAnalysis) => {
        const found = template.listAnalysesStatus.find((x) => x.analysisId === typeOfAnalysis.id);
        setValue(typeOfAnalysis.id as keyof FormFields, !!found);
      });
    }
  };

  const customCommodity = watch('customCommodity');
  useEffect(() => {
    if (!customCommodity) {
      return;
    }

    debouncedGetListsByCommodity(customCommodity);
  }, [customCommodity]);

  const handleAnalysisChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: boolean) => void;
    },
    id: (typeof typeOfAnalysisMap)[number]['id']
  ) => {
    field.onChange(e.target.checked);

    if (id === 'palmRiskAssessment' && e.target.checked) {
      setValue('FCD', true);
    } else if (id === 'FCD' && !e.target.checked) {
      setValue('palmRiskAssessment', false);
    }
  };

  const onSubmit = (data: FormFields) => {
    // this should never happen due to form validation, but just in case...
    if (data.commodity === 'Other' && !data.customCommodity) {
      setError('customCommodity', { message: 'Invalid custom commodity' });
      return;
    }

    setUploadLocationConfigureList({
      commodity: (data.commodity === 'Other' ? data.customCommodity : data.commodity) as string,
      newListName: data.newListName ?? '',
      existingList: data.existingListName
        ? { name: data.existingListName ?? '', ...existingList.current }
        : null,
      typeOfAnalysis: {
        palmRiskAssessment: data.palmRiskAssessment,
        FCD: data.FCD,
        AFI: data.AFI,
        ALERTS: data.ALERTS,
      },
    });

    history.push('SUMMARY_AND_SUBMIT');
  };

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
                    const value = (e.target.value as CommoditiesType) || '';
                    reset({ commodity: value });
                    setFormFields((v) => ({ ...v, existingListName: '' }));
                    field.onChange(value);
                  }}
                >
                  {Object.values(commodities).map((commodity) => (
                    <MenuItem key={commodity} value={commodity}>
                      {commodity}
                    </MenuItem>
                  ))}
                </Select>
                {!!errors.commodity && <FormHelperText>Enter the commodity</FormHelperText>}
              </FormControl>
            )}
          />
          {selectedCommodity === 'Other' && (
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
                      InputProps={{ inputProps: { 'data-testid': 'custom-commodity-input' } }}
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

              if (isLoading) {
                return (
                  <Box
                    sx={{
                      flex: 1,
                      border: (theme) => `1px solid ${theme.palette.info.main}`,
                      borderRadius: 1,
                    }}
                  >
                    <Skeleton variant="rectangular" sx={{ height: 40 }} />
                  </Box>
                );
              }

              return (
                <FormControl error={!!error} sx={{ flex: '1' }}>
                  <Select
                    disabled={validLists.length === 0 || !!formFields.newListName}
                    size="small"
                    value={formFields.existingListName}
                    onChange={(e) => handleChangeExistingListName(e, field)}
                  >
                    {validLists.map(({ id, name }) => (
                      <MenuItem key={id} value={name}>
                        {name}
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
            .filter((x) => selectedCommodity === 'Palm oil' || x.id !== 'palmRiskAssessment')
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
