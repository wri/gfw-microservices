import { useCallback, useEffect, useRef, useState, ChangeEvent, ReactNode } from 'react';
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
  SxProps,
} from '@mui/material';
import { ArrowBackIos, ArrowForwardIos, Close } from '@mui/icons-material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useHistory } from '../hooks';
import { PillButton, HelperTextWithPopover } from '../../../../../components';
import { useUploadLocation } from '../contexts';
import { NavBar } from '../components';
import { UserList } from '../types';
import { typeOfAnalysisMap, commodities, customCommodities } from '../utils/constants';
import { useFetch } from '../../../../../hooks';
import debounce from 'lodash/debounce';
import { fetchListsByCommodity } from '../../../../../api/list';
import {
  analysisTypes,
  analysisIdsOptionsMap,
  analysisTypesOptionsNewNames,
  palmRiskAnalysis,
  AlertsAnalysisFrequency,
  weeklyAlertsAnalysis,
} from '../../../../../../config/env/analysisTypes.constants';
import { listNameSchema } from '../utils/schema';
import { DATA_CY, ReusableText } from '../../../../../utils/constants';

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
      Weekly: z.coerce.boolean(),
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
    clearUploadType,
    setUploadLocationConfigureList,
    uploadLocationState: {
      uploadType,
      isUmlFile,
      commodity,
      newListName,
      existingList,
      typeOfAnalysis,
    },
  } = useUploadLocation();

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
      commodity: (commodity as CommoditiesType) || ('' as CommoditiesType),
      newListName: newListName || '',
      existingListName: existingList?.name || '',
      customCommodity: '',
      PalmRisk: typeOfAnalysis.PalmRisk || false,
      FCD: typeOfAnalysis.FCD || false,
      ALERTS: typeOfAnalysis.ALERTS || false,
      AFI: typeOfAnalysis.AFI || false,
      Weekly: typeOfAnalysis.Weekly || false,
    },
  });

  const existingListRef = useRef<{ id: number; analysisIds: string[] }>({
    id: existingList?.id || 0,
    analysisIds: existingList?.analysisIds || [],
  });

  const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

  const [formFields, setFormFields] = useState<{
    newListName: string;
    existingListName: string;
  }>({
    newListName: newListName || '',
    existingListName: existingList?.name || '',
  });

  const { data: validLists, isLoading, request } = useFetch<{ id: number; name: string }[]>();

  const mainAnalyses = analysisTypesOptionsNewNames.filter((a) => a.showInUI);

  const getOptionDetails = (optionId: string) => {
    if (optionId === analysisTypes.PALM_RISK) {
      return palmRiskAnalysis;
    }
    // TODO: Insert featureFlag here to keep it hidden
    if (optionId === AlertsAnalysisFrequency.WEEKLY) {
      return weeklyAlertsAnalysis;
    }

    return null;
  };

  // Restore form state from context when component mounts
  // This should only run once on mount, not when context values change
  useEffect(() => {
    if (commodity) {
      setValue('commodity', commodity as CommoditiesType);
      setFormFields({
        newListName: newListName || '',
        existingListName: existingList?.name || '',
      });
    }

    if (existingList) {
      existingListRef.current = {
        id: existingList.id,
        analysisIds: existingList.analysisIds,
      };
    }
  }, []);

  // UML auto-population effect (only runs once when isUmlFile is true and form is empty)
  useEffect(() => {
    if (isUmlFile && !commodity) {
      setValue('commodity', 'Palm oil');
    }
  }, [isUmlFile, setValue, commodity]);

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

    const analysisIds = [];
    const template = userLists.find((list) => list.list_name === value);

    for (const analysisStatus of template.listAnalysesStatus) {
      const { analysisId, options } = analysisStatus;

      const isFCDWithPalmRisk =
        analysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS &&
        options === analysisTypes.PALM_RISK;

      const isWeeklyAlerts =
        analysisId === analysisTypes.ALERTS && options === AlertsAnalysisFrequency.WEEKLY;

      const analysisIdsToPush = isFCDWithPalmRisk
        ? [analysisId, analysisTypes.PALM_RISK] // FCD with PalmRisk sub-analysis
        : isWeeklyAlerts
        ? [analysisId, AlertsAnalysisFrequency.WEEKLY] // Weekly with Alerts
        : [analysisId];

      for (const id of analysisIdsToPush) {
        analysisIds.push({
          ...analysisStatus,
          analysisId: id,
        });
      }
    }
    if (template?.id) {
      existingListRef.current = {
        id: template.id,
        analysisIds: analysisIds.map((x) => x.analysisId) || [],
      };
      Object.keys(typeOfAnalysis).forEach((typeOfAnalysis) => {
        const found = analysisIds.find((x) => x.analysisId === typeOfAnalysis);
        setValue(typeOfAnalysis as keyof FormFields, !!found);
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
    id: (typeof typeOfAnalysisMap)[number]['id'] | keyof typeof typeOfAnalysis
  ) => {
    field.onChange(e.target.checked);

    // Weekly requires ALERTS to be selected (it's a child analysis of ALERTS)
    if (id === AlertsAnalysisFrequency.WEEKLY && e.target.checked) {
      setValue(analysisTypes.ALERTS, true);
    }

    // GPV-5141 if ALERTS is selected have WEEKLY be selected by default
    if (id === analysisTypes.ALERTS && e.target.checked) {
      setValue(AlertsAnalysisFrequency.WEEKLY, true);
    }

    // If ALERTS is unchecked, also uncheck Weekly (parent-child relationship)
    if (id === analysisTypes.ALERTS && !e.target.checked) {
      setValue(AlertsAnalysisFrequency.WEEKLY, false);
    }

    // Palm Risk requires FCD to be selected (it's a child analysis of FCD)
    if (id === analysisTypes.PALM_RISK && e.target.checked) {
      setValue(analysisTypes.FOREST_CHANGE_DIAGNOSTICS, true);
    }

    // If FCD is unchecked, also uncheck Palm Risk (parent-child relationship)
    if (id === analysisTypes.FOREST_CHANGE_DIAGNOSTICS && !e.target.checked) {
      setValue(analysisTypes.PALM_RISK, false);
    }
  };

  const onSubmit = (data: FormFields) => {
    if (data.commodity === 'Other' && !data.customCommodity) {
      setError('customCommodity', { message: 'Invalid custom commodity' });
      return;
    }

    setUploadLocationConfigureList({
      commodity: (data.commodity === 'Other' ? data.customCommodity : data.commodity) as string,
      newListName: data.newListName ?? '',
      existingList: data.existingListName
        ? { name: data.existingListName ?? '', ...existingListRef.current }
        : null,
      typeOfAnalysis: {
        PalmRisk: data.PalmRisk,
        FCD: data.FCD,
        AFI: data.AFI,
        ALERTS: data.ALERTS,
        Weekly: data.Weekly,
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2, width: 'fit-content' }}>
          {mainAnalyses.map(({ id, label, description }) => {
            const isAfi = id === analysisTypes.DEFORESTATION_KPIS;
            const childOptions = analysisIdsOptionsMap[id] || [];

            return (
              <Box key={id}>
                <Controller
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
                          data-testid={`checkbox-${id.toLowerCase()}`}
                        />
                      }
                      sx={{
                        textTransform: 'none',
                        '&:hover': { cursor: 'default' },
                      }}
                      label={
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            lineHeight: 0,
                          }}
                          onClick={(e) => {
                            const tag = (e.target as HTMLElement).tagName;
                            if (tag !== 'A') {
                              e.stopPropagation();
                              e.preventDefault();
                            }
                          }}
                        >
                          <Box>
                            <Box sx={{ display: 'flex', mb: isAfi ? 0.5 : 0 }}>
                              <Typography variant="body2">{label}</Typography>
                              {isAfi && (
                                <HelperTextWithPopover
                                  label={
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                      Recommended to support EUDR compliance
                                    </Typography>
                                  }
                                  sx={{
                                    px: 1.5,
                                    py: 0,
                                    ml: 1,
                                    borderRadius: 20,
                                    backgroundColor: (theme) => theme.palette.secondary[200],
                                  }}
                                  popoverMarginLeft={2}
                                >
                                  <Box sx={{ width: (theme) => theme.spacing(37), p: 1 }}>
                                    <Typography variant="caption">
                                      {ReusableText.EudrLegalDisclaimer}
                                    </Typography>
                                  </Box>
                                </HelperTextWithPopover>
                              )}
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {description}
                            </Typography>
                          </Box>
                          <HelperTextWithPopover>
                            <Box sx={{ width: (theme) => theme.spacing(37), p: 1 }}>
                              <Typography variant="caption">
                                {listOfPopoverHelperText[id]}
                              </Typography>
                            </Box>
                          </HelperTextWithPopover>
                        </Box>
                      }
                    />
                  )}
                />

                {/* Child Options (nested under parent) */}
                {childOptions.map((optionId) => {
                  const optionDetails = getOptionDetails(optionId);

                  // Skip if no details found (e.g., Weekly is not a UI checkbox yet)
                  if (!optionDetails) {
                    return null;
                  }

                  // commodity restriction for PalmRisk
                  if (optionId === analysisTypes.PALM_RISK && selectedCommodity !== 'Palm oil') {
                    return null;
                  }

                  return (
                    <Controller
                      key={optionId}
                      name={optionId as keyof FormFields}
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              sx={{ py: 0 }}
                              checked={!!field.value}
                              onChange={(e) => {
                                handleAnalysisChange(e, field, optionId);
                              }}
                              inputRef={field.ref}
                              data-testid={`checkbox-${optionId.toLowerCase()}`}
                            />
                          }
                          sx={{
                            textTransform: 'none',
                            ml: 2,
                            mt: 2,
                            '&:hover': { cursor: 'default' },
                            display: 'flex',
                          }}
                          label={
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                lineHeight: 0,
                              }}
                              onClick={(e) => {
                                const tag = (e.target as HTMLElement).tagName;
                                if (tag !== 'A') {
                                  e.stopPropagation();
                                  e.preventDefault();
                                }
                              }}
                            >
                              <Box>
                                <Typography variant="body2">{optionDetails.label}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {optionDetails.description}
                                </Typography>
                              </Box>
                              {listOfPopoverHelperText[optionId] && (
                                <HelperTextWithPopover>
                                  <Box sx={{ width: (theme) => theme.spacing(37), p: 1 }}>
                                    <Typography variant="caption">
                                      {listOfPopoverHelperText[optionId]}
                                    </Typography>
                                  </Box>
                                </HelperTextWithPopover>
                              )}
                            </Box>
                          }
                        />
                      )}
                    />
                  );
                })}
              </Box>
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

const popoverHelperTextStyle: SxProps = {
  '& > a': {
    color: '#00F',
    textDecoration: 'underline',
  },
};

const listOfPopoverHelperText: {
  [analysisTypes.DEFORESTATION_KPIS]: ReactNode;
  [analysisTypes.ALERTS]: ReactNode;
  [analysisTypes.FOREST_CHANGE_DIAGNOSTICS]: ReactNode;
  [analysisTypes.PALM_RISK]: ReactNode;
} = {
  AFI: (
    <Typography variant="caption" sx={popoverHelperTextStyle}>
      This analysis provides users with statistics on forest coverage and forest loss which occurred
      after 2020. It differs from other analyses on GFW Pro in that it is based upon forest maps
      aligned as closely as possible with the definition of forest adopted by the{' '}
      <a href="https://www.fao.org/home/en/" target="_blank">
        United Nations Food and Agriculture Organization
      </a>
      . The 2020 cut-off date used here aligns with requirements recently adopted by the European
      Union, and the summary statistics may be referred to when conducting due diligence assessments
      and disclosing deforestation within the supply chain. This analysis utilizes two maps of 2020
      forest cover: the Natural Forest map, derived from the{' '}
      <a href="https://wri-datalab.earthengine.app/view/sbtn-natural-lands" target="_blank">
        Natural Lands Ecosystem Map
      </a>{' '}
      developed by the Science Based Targets Network (SBTN), and the{' '}
      <a href="https://forest-observatory.ec.europa.eu/forest/gfc2020" target="_blank">
        Global Map of Forest Cover
      </a>
      , developed by the Joint Research Centre.
    </Typography>
  ),
  ALERTS: (
    <Typography variant="caption">
      This analysis collates recent deforestation and fire alerts on your locations. Updated on a
      weekly basis, you can explore alerts from the VIIRS active fires satellite data as well as
      GFW's integrated deforestation alerts.
    </Typography>
  ),
  FCD: (
    <Typography variant="caption" sx={popoverHelperTextStyle}>
      This analysis breaks down annual{' '}
      <a
        href="https://data.globalforestwatch.org/maps/gfw::tree-cover-loss-1/about"
        target="_blank"
      >
        tree cover loss
      </a>{' '}
      on your locations using the Hansen 2024 data. In addition to total tree cover loss, you can
      explore tree cover loss on the most frequently referenced sensitive forest areas in
      deforestation policies. These datasets can also help determine when sensitive areas were
      cleared. Companies can connect this information with their deforestation policies to
      demonstrate compliance.
    </Typography>
  ),
  PalmRisk: (
    <Typography variant="caption">
      The PALM Risk Tool assesses the risk that a palm oil mill is associated with deforestation.
      The analysis can be applied across an entire supply chain to generate a relative risk ranking
      of multiple mills. This information can support decision-making by buyers and traders as they
      prioritize engagement and interventions within their supply chain. This analysis should only
      be applied to palm oil mills.
    </Typography>
  ),
};
