import { useCallback, useEffect, useRef, useState, ChangeEvent } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { typeOfAnalysisMap, commodities, customCommodities } from '../utils/constants';
import { useFetch } from '../../../../../hooks';
import debounce from 'lodash/debounce';
import { fetchListsByCommodity } from '../../../../../api/list';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import { listNameSchema } from '../utils/schema';
import { DATA_CY } from '../../../../../utils/constants';

type CommoditiesType = (typeof commodities)[keyof typeof commodities];
const commodityValues = Object.values(commodities) as [CommoditiesType, ...CommoditiesType[]];

// @userLists param will be deprecated when new endpoint for typeOfAnalysis is released
export function ConfigureList({ userLists }: { userLists: UserList[] }) {
  const schema = z
    .object({
      commodity: z.enum(commodityValues),
      newListName: listNameSchema.optional(),
      existingListName: z.string().optional(),
      FCD: z.coerce.boolean(),
      PalmRisk: z.coerce.boolean(),
      ALERTS: z.coerce.boolean(),
      AFI: z.coerce.boolean(),
      customCommodity: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.newListName && !data.existingListName) {
        ctx.addIssue({
          path: ['newListName'],
          code: z.ZodIssueCode.custom,
          message: 'You must provide at least one list name.',
        });
        ctx.addIssue({
          path: ['existingListName'],
          code: z.ZodIssueCode.custom,
          message: 'You must provide at least one list name.',
        });
      }

      if (
        data.commodity === 'Other' &&
        (!data.customCommodity || data.customCommodity.trim() === '')
      ) {
        ctx.addIssue({
          path: ['customCommodity'],
          code: z.ZodIssueCode.custom,
          message: 'Enter custom commodity',
        });
      }

      if (
        userLists.some((list) => list.list_name?.toLowerCase() === data.newListName?.toLowerCase())
      ) {
        ctx.addIssue({
          path: ['newListName'],
          code: z.ZodIssueCode.custom,
          message: 'This list name already exists',
        });
      }

      if (!data.AFI && !data.ALERTS && !data.FCD) {
        ctx.addIssue({
          path: ['noAnalysisSelected'],
          code: z.ZodIssueCode.custom,
          message: 'You must select at least one type of analysis.',
        });
      }
    });

  type FormFields = z.infer<typeof schema>;
  const history = useHistory();
  const {
    handleSubmit,
    control,
    register,
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
      PalmRisk: false,
      FCD: false,
      ALERTS: false,
      AFI: false,
      customCommodity: '',
    },
  });
  const {
    clearUploadType,
    setUploadLocationConfigureList,
    uploadLocationState: { uploadType },
  } = useUploadLocation();

  const existingList = useRef<{ id: number; analysisIds: string[] }>({ id: 0, analysisIds: [] });
  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const [formFields, setFormFields] = useState<{
    newListName: string;
    existingListName: string;
  }>({
    newListName: '',
    existingListName: '',
  });

  const { data: validLists, isLoading, request } = useFetch<{ id: number; name: string }[]>();

  const selectedCommodity = watch('commodity') as CommoditiesType;
  useEffect(() => {
    if (!selectedCommodity || selectedCommodity === 'Other') {
      return;
    }

    const commodityDB = customCommodities.includes(selectedCommodity)
      ? `GFWP_${selectedCommodity}`
      : selectedCommodity;

    getListsByCommodity(commodityDB);
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
    if (!validLists) {
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

    debouncedGetListsByCommodity(`GFWP_${customCommodity}`);
  }, [customCommodity]);

  const handleAnalysisChange = (
    e: ChangeEvent<HTMLInputElement>,
    field: {
      onChange: (value: boolean) => void;
    },
    id: (typeof typeOfAnalysisMap)[number]['id']
  ) => {
    field.onChange(e.target.checked);

    if (id === analysisTypes.PALM_RISK && e.target.checked) {
      setValue('FCD', true);
    } else if (id === 'FCD' && !e.target.checked) {
      setValue(analysisTypes.PALM_RISK, false);
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
        PalmRisk: data.PalmRisk,
        FCD: data.FCD,
        AFI: data.AFI,
        ALERTS: data.ALERTS,
      },
    });

    history.push('SUMMARY_AND_SUBMIT');
  };
  const noAnalysisSelectedError = 'noAnalysisSelected' in errors ? errors.noAnalysisSelected : null;

  useEffect(() => {
    if (noAnalysisSelectedError) {
      setIsConfirmationDialogOpen(true);
    }
  }, [noAnalysisSelectedError]);

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
                    reset({ commodity: value as CommoditiesType });
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

              <TextField
                size="small"
                sx={{ flex: '1' }}
                error={!!errors.customCommodity}
                helperText={errors.customCommodity ? 'Enter custom commodity' : ''}
                InputProps={{ inputProps: { 'data-testid': 'custom-commodity-input' } }}
                {...register('customCommodity')}
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
              const error = errors.newListName;

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
              const error = errors.existingListName;

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
                    disabled={Boolean(!validLists?.length || formFields.newListName)}
                    size="small"
                    value={formFields.existingListName}
                    onChange={(e) => handleChangeExistingListName(e, field)}
                  >
                    {validLists?.map(({ id, name }) => (
                      <MenuItem key={id} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                  {!!error && (
                    <FormHelperText>{error.message ?? 'Enter the list name'}</FormHelperText>
                  )}
                  {validLists?.length === 0 && !error && (
                    <FormHelperText>
                      {'No matching list found for the chosen commodity.'}
                    </FormHelperText>
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
            .filter((x) => selectedCommodity === 'Palm oil' || x.id !== analysisTypes.PALM_RISK)
            .map(({ id, label, description }) => {
              const isPalmRisk = id === analysisTypes.PALM_RISK;
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
            color="info"
            startIcon={<ArrowBackIos />}
            onClick={history.goBack}
            sx={{ mr: 'auto' }}
          >
            Back
          </PillButton>

          <PillButton
            variant="contained"
            color="info"
            startIcon={<Close />}
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadType!]?.CONFIGURE_CANCEL}
            onClick={clearUploadType}
          >
            Cancel
          </PillButton>
          <PillButton
            type="submit"
            variant="contained"
            data-cy={DATA_CY.NEW_UPLOAD_WORKFLOW[uploadType!]?.CONFIGURE_NEXT}
            startIcon={<ArrowForwardIos />}
          >
            Next
          </PillButton>
        </Box>
      </Card>
      <Dialog open={isConfirmationDialogOpen}>
        <DialogTitle>
          <Typography variant="h6">Select an analysis to continue</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'justify' }}>
          <Typography variant="body2">
            To complete your list configuration, please select at least one analysis type. This
            ensures your submission will be processed successfully.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ ml: 'auto', pb: 2 }}>
          <PillButton color="info" onClick={() => setIsConfirmationDialogOpen(false)}>
            Cancel
          </PillButton>
          <PillButton variant="contained" onClick={() => setIsConfirmationDialogOpen(false)}>
            Select Analysis
          </PillButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
