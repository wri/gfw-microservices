import React from 'react';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FeatureFlagsList from '../../js/components/featuresFlags/FeatureFlagsList';
import { useFeatureFlagStateContext } from '../../js/components/featuresFlags/FeatureFlagStateContext';

jest.mock('../../js/components/featuresFlags/FeatureFlagStateContext');

afterEach(cleanup);

test('renders FeatureFlagsList component', () => {
  const featureFlagsList = [
    { flagId: 'TestFlag1', updateDateTime: '2023-01-01T12:00:00Z' },
    { flagId: 'TestFlag2', updateDateTime: '2023-01-02T12:00:00Z' },
  ];

  useFeatureFlagStateContext.mockReturnValue({
    featureFlagsList,
    selectedFeatureFlag: null,
    setSelectedFeatureFlag: jest.fn(),
  });

  render(<FeatureFlagsList />);

  const rows = screen.getAllByRole('row');
  expect(rows).toHaveLength(featureFlagsList.length + 1);

  featureFlagsList.forEach((flag) => {
    expect(screen.getByText(flag.flagId)).toBeInTheDocument();
  });

  featureFlagsList.forEach((flag) => {
    const formattedDate = '01/01/2023 - 09:00';

    expect(screen.getByText(formattedDate)).toBeInTheDocument();
  });
});

test('selects a feature flag on click', () => {
  const featureFlagsList = [{ flagId: 'TestFlag1', updateDateTime: '2023-01-01T12:00:00Z' }];
  const setSelectedFeatureFlagMock = jest.fn();

  useFeatureFlagStateContext.mockReturnValue({
    featureFlagsList,
    selectedFeatureFlag: null,
    setSelectedFeatureFlag: setSelectedFeatureFlagMock,
  });

  render(<FeatureFlagsList />);

  const row = screen.getByRole('row', { name: /TestFlag1/i });
  fireEvent.click(row);

  expect(setSelectedFeatureFlagMock).toHaveBeenCalledWith(featureFlagsList[0]);
});
