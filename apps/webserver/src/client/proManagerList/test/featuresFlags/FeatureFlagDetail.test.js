import React from 'react';
import { cleanup, screen, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FeatureFlagDetail from '../../js/components/featuresFlags/FeatureFlagDetail';
import { useFeatureFlagStateContext } from '../../js/components/featuresFlags/FeatureFlagStateContext';

jest.mock('../../js/components/featuresFlags/FeatureFlagStateContext');

const mockFeatureFlagContext = {
  selectedFeatureFlag: {
    flagId: 'TestFlag',
    flagState: true,
    updateDateTime: '2023-01-01T12:00:00Z',
  },
  accountsWithFeatureFlagsByFlagId: [
    {
      featureFlag: {
        flagId: 'TestFlag',
        flagState: true,
        updateDateTime: '2023-01-01T12:00:00Z',
      },
      organization_id: 1,
      organization_name: 'Organization 1',
    },
  ],
  featureFlagsList: [
    { flagId: 'TestFlag1', updateDateTime: '2023-01-01T12:00:00Z' },
    { flagId: 'TestFlag2', updateDateTime: '2023-01-02T12:00:00Z' },
  ],
  upsertFeatureFlagByFlagId: jest.fn(),
};

useFeatureFlagStateContext.mockReturnValue(mockFeatureFlagContext);
afterEach(cleanup);

describe('FeatureFlagDetail Component', () => {
  test('renders component with selectedFeatureFlag', () => {
    render(<FeatureFlagDetail />);

    expect(screen.getByText('FEATURE DETAILS')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('TestFlag')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
    expect(screen.getByLabelText('Active')).toBeInTheDocument();
    expect(screen.getByText('ACCOUNTS')).toBeInTheDocument();
    expect(screen.getByText('Organization 1')).toBeInTheDocument();

    const switchElement = getByRole('checkbox');
    expect(switchElement).toBeInTheDocument();
    expect(switchElement).toBeChecked();
  });

  test('handles switch change', () => {
    render(<FeatureFlagDetail />);
    const switchElement = screen.getByRole('checkbox');
    fireEvent.click(switchElement);

    expect(mockFeatureFlagContext.upsertFeatureFlagByFlagId).toHaveBeenCalledWith(false, 1);
  });
});
