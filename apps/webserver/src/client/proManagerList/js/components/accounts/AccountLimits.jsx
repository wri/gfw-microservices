import { useState, useEffect } from 'react';
import { Typography, TextField, Grid } from '@mui/material';
import errorLogger from '../../../../common/js/utils/errorLogger';
import featureFlags from '../../../../../utils/general.utils';

import { PillButton } from '../../../../components';
import {
  accountLimitsStrings,
  subscriptionStatusOptions,
  SUBSCRIPTION_STATUSES,
} from '../../../../common/js/config';
import SettingSection from '../../../../common/js/components/SettingSection';

import DialogProvider, { useDialog } from '../../../../common/js/components/Dialog';
import FieldLabel from './FieldLabel';

/**
 * @summary {[subscription_status_id]: defaultFields}
 */
const generateGlobalLimitsFormDataObject = (subscriptionOptions) => {
  const defaultFields = {
    max_locations_per_year: 0,
    MaxAreaAnalyzeablePerYear: 0,
  };

  let returningObject = {};
  for (const option of subscriptionOptions) {
    returningObject[option.value] = {
      ...defaultFields,
      subscriptionStatusId: option.value,
    };
  }

  return returningObject;
};

const globalLimitsFormDataObject = generateGlobalLimitsFormDataObject(subscriptionStatusOptions);
const { STANDARD: STANDARD_SUBSCRIPTION, PREMIUM: PREMIUM_SUBSCRIPTION } = SUBSCRIPTION_STATUSES;
const { isTokenizationAvailable } = featureFlags;

/**
 * Manage global accounts limits based on subscriptions
 * @param {boolean} isLoading
 * @param {function} setIsLoading
 */
function AccountLimitsGlobal({ setIsLoading }) {
  const dialog = useDialog();
  const [globalLimitsFormData, setGlobalLimitsFormData] = useState(globalLimitsFormDataObject);
  const [formHasChanges, setFormHasChanges] = useState(false);
  const locationsLabel = isTokenizationAvailable
    ? accountLimitsStrings.tokensPerYear
    : accountLimitsStrings.locationsPerYear;

  const onChangeUpdateField = (orgType, fieldName, value) => {
    setGlobalLimitsFormData((prevData) => {
      setFormHasChanges(prevData[orgType][fieldName] !== value);
      return {
        ...prevData,
        [orgType]: {
          ...prevData[orgType],
          [fieldName]: value,
          changed: prevData[orgType][fieldName] !== value,
        },
      };
    });
  };

  const updateGlobalAnalysisLimits = (payload) => {
    // Minimize requests and only update changed fields
    let requests = Object.keys(payload)
      .map((globalLimitType) => {
        if (payload[globalLimitType].changed) {
          return fetch('/pro-manager/updateGlobalAnalysisLimits', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionStatusId: globalLimitType,
              ...payload[globalLimitType],
            }),
          }).then((res) => res.json());
        }
        return null;
      })
      .filter((request) => request !== null);

    if (requests.length > 0) {
      // Process all requests together
      dialog.openDialog('Updating Limits', 'Please wait...', true);
      Promise.all(requests)
        .then((data) => {
          const allSuccessful = data.every((response) => response.status === 'success');
          dialog.openDialog();
          if (allSuccessful) {
            dialog.setDialogTitle('Global Limits Updated');
          } else {
            dialog.setDialogTitle('Some Updates Failed');
          }
          dialog.disableDialogAction(false);
          setFormHasChanges(false);
        })
        .catch(() => {
          dialog.setDialogTitle('Oops! Something went wrong');
          dialog.setDialogMessage('Please try again.');
          dialog.disableDialogAction(false);
        });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    const analysisLimitsByOrgType = Object.keys(globalLimitsFormData);

    const fetchPromises = analysisLimitsByOrgType.map((globalLimitOrgType) => {
      return fetch(`/analytics/limit?organizationType=${globalLimitOrgType}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {
          'Content-type': 'application/json',
        },
      }).then((res) => res.json());
    });

    Promise.all(fetchPromises)
      .then((responses) => {
        const updatedFormData = {};

        responses.forEach((data, index) => {
          updatedFormData[analysisLimitsByOrgType[index]] = { ...data.pop() };
        });
        setGlobalLimitsFormData((prevGlobalValues) => ({
          ...prevGlobalValues,
          ...updatedFormData,
        }));
        setIsLoading(false);
      })
      .catch((error) => {
        errorLogger.error('Error fetching account limits', {
          component: 'AccountLimits',
          action: 'fetchLimits',
          error,
        });
        dialog.openDialog('Oops! Something went wrong', 'Please try again.');
        dialog.disableDialogAction(false);
        setIsLoading(false);
      });
  }, []);

  return (
    <>
      <Grid container justifyContent="space-between" sx={{ marginBottom: '1.5rem' }}>
        <Typography variant="h3">{accountLimitsStrings.pageHeading}</Typography>
      </Grid>
      <SettingSection heading={accountLimitsStrings.stantardSubscriptionSection}>
        <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2}>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={locationsLabel}>{locationsLabel}</FieldLabel>
              <TextField
                name="max_locations_per_year"
                id="STANDARD_SUBSCRIPTION-max_locations_per_year"
                onChange={({ target }) =>
                  onChangeUpdateField(STANDARD_SUBSCRIPTION, target.name, target.value)
                }
                value={globalLimitsFormData[STANDARD_SUBSCRIPTION]?.max_locations_per_year || 0}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={accountLimitsStrings.areaPerYear}>
                {accountLimitsStrings.areaPerYear}
              </FieldLabel>
              <TextField
                name="MaxAreaAnalyzeablePerYear"
                id="STANDARD_SUBSCRIPTION-MaxAreaAnalyzeablePerYear"
                onChange={({ target }) =>
                  onChangeUpdateField(STANDARD_SUBSCRIPTION, target.name, target.value)
                }
                value={globalLimitsFormData[STANDARD_SUBSCRIPTION]?.MaxAreaAnalyzeablePerYear || 0}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Grid>
      </SettingSection>
      <SettingSection heading={accountLimitsStrings.premiumSubscriptionSection} hiddenDivider>
        <Grid sx={{ marginBottom: '1.5rem' }} container spacing={2}>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={locationsLabel}>{locationsLabel}</FieldLabel>
              <TextField
                name="max_locations_per_year"
                id="PREMIUM_SUBSCRIPTION-max_locations_per_year"
                onChange={({ target }) =>
                  onChangeUpdateField(PREMIUM_SUBSCRIPTION, target.name, target.value)
                }
                value={globalLimitsFormData[PREMIUM_SUBSCRIPTION]?.max_locations_per_year || 0}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
          <Grid item sm={6} xs={12}>
            <Grid container direction="column">
              <FieldLabel aria-label={accountLimitsStrings.areaPerYear}>
                {accountLimitsStrings.areaPerYear}
              </FieldLabel>
              <TextField
                name="MaxAreaAnalyzeablePerYear"
                id="PREMIUM_SUBSCRIPTION-MaxAreaAnalyzeablePerYear"
                onChange={({ target }) =>
                  onChangeUpdateField(PREMIUM_SUBSCRIPTION, target.name, target.value)
                }
                value={globalLimitsFormData[PREMIUM_SUBSCRIPTION]?.MaxAreaAnalyzeablePerYear || 0}
                size="small"
                variant="outlined"
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid container spacing={2} rowSpacing={2}>
          <Grid item sm={6} xs={12}>
            <PillButton
              variant="contained"
              size="small"
              disabled={!formHasChanges}
              onClick={() => updateGlobalAnalysisLimits(globalLimitsFormData)}
              sx={{ marginBottom: 1 }}
            >
              Update Limits
            </PillButton>
            {isTokenizationAvailable && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Updating the limits will affect all organizations at time of account renewal. Limits
                are visible to both internal and external users.
              </Typography>
            )}
          </Grid>
        </Grid>
      </SettingSection>
    </>
  );
}

export default (props) => (
  <DialogProvider>
    <AccountLimitsGlobal {...props} />
  </DialogProvider>
);
