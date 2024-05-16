import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import {
  getAllFeatureFlags,
  getFeatureFlagsByFlagId,
  getAccountListData,
  upsertFeatureFlag,
} from './featureFlags.utils';

const FeatureFlagStateContext = createContext();

export function useFeatureFlagStateContext() {
  return useContext(FeatureFlagStateContext);
}

export default function FeatureFlagContextProvider({ children, setIsLoading }) {
  const [featureFlagsList, setFeatureFlagsList] = useState([]);
  const [selectedFeatureFlag, setSelectedFeatureFlag] = useState(null);
  const [featureFlagsListByFlagId, setFeatureFlagsListByFlagId] = useState([]);
  const [accountsWithFeatureFlagsByFlagId, setAccountsWithFeatureFlagsByFlagId] = useState([]);
  const [accountList, setAccountList] = useState([]);

  const upsertFeatureFlagByFlagId = useCallback(
    (flagState, orgId = null) => {
      setIsLoading(true);
      return upsertFeatureFlag({
        flagId: selectedFeatureFlag?.flagId,
        flagState,
        orgId,
      }).then((upsertedFeatureFlag) => {
        if (orgId) {
          setFeatureFlagsListByFlagId((prevFeatureFlagListValues) => {
            return prevFeatureFlagListValues.map((flag) => {
              if (
                flag.flagId === upsertedFeatureFlag.flagId &&
                flag.orgId === upsertedFeatureFlag.orgId
              ) {
                return upsertedFeatureFlag;
              }

              return flag;
            });
          });
        } else {
          setSelectedFeatureFlag(upsertedFeatureFlag);
          setFeatureFlagsList((prev) => {
            const { flagId } = upsertedFeatureFlag;
            const idx = prev.findIndex((featureFlag) => featureFlag.flagId == flagId);
            prev[idx] = upsertedFeatureFlag;
            return prev;
          });
        }
        return upsertedFeatureFlag;
      });
    },
    [selectedFeatureFlag]
  );

  const addFeatureFlagForAccountId = (orgId) => {
    return upsertFeatureFlagByFlagId(!!selectedFeatureFlag?.flagState, orgId).then(
      (newFeatureFlagRecord) => {
        if (newFeatureFlagRecord) {
          setFeatureFlagsListByFlagId([...featureFlagsListByFlagId, newFeatureFlagRecord]);
        }
      }
    );
  };

  useEffect(() => {
    getAllFeatureFlags().then((data) => {
      setFeatureFlagsList(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getFeatureFlagsByFlagId(selectedFeatureFlag?.flagId), getAccountListData()]).then(
      ([featureFlagsListByFlagIdData, accountListData]) => {
        const { accounts } = accountListData;
        setAccountList(accounts);
        setFeatureFlagsListByFlagId(featureFlagsListByFlagIdData);
      }
    );
  }, [selectedFeatureFlag]);

  useEffect(() => {
    featureFlagsListByFlagId.length > 0 && setIsLoading(false);
    setAccountsWithFeatureFlagsByFlagId(
      featureFlagsListByFlagId
        .filter((flag) => flag.orgId)
        .map((flag) => {
          const foundAccount = accountList.find((acc) => acc.organization_id === flag.orgId);
          return {
            ...foundAccount,
            featureFlag: flag,
          };
        })
    );
  }, [featureFlagsListByFlagId, accountList]);

  return (
    <FeatureFlagStateContext.Provider
      value={{
        selectedFeatureFlag,
        setSelectedFeatureFlag,
        featureFlagsListByFlagId,
        featureFlagsList,
        accountList,
        accountsWithFeatureFlagsByFlagId,
        addFeatureFlagForAccountId,
        upsertFeatureFlagByFlagId,
      }}
    >
      {children}
    </FeatureFlagStateContext.Provider>
  );
}
