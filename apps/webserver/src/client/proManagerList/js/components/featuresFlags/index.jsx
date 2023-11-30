import React, { useEffect } from 'react';
import FeatureFlagContextProvider from './FeatureFlagStateContext';
import PageHeader from './PageHeader';
import FeatureFlagsList from './FeatureFlagsList';
import FeatureFlagDetail from './FeatureFlagDetail';

function FeatureFlags(props) {
  /* props => { isLoading, setIsLoading } */
  return (
    <FeatureFlagContextProvider {...props}>
      <PageHeader />
      <FeatureFlagsList />
      <FeatureFlagDetail />
    </FeatureFlagContextProvider>
  );
}

export default FeatureFlags;
