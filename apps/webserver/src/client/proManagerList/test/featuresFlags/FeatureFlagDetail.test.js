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

jest.mock('../../js/components/featuresFlags/AddCompany', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="addCompanyMock">AddCompany Mock</div>),
}));

useFeatureFlagStateContext.mockReturnValue(mockFeatureFlagContext);
afterEach(cleanup);

describe('FeatureFlagDetail Component', () => {
  test('renders component with selectedFeatureFlag', () => {
    render(<FeatureFlagDetail />);

    expect(screen.getByText('FEATURE DETAILS')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('TestFlag')).toBeInTheDocument();
    expect(screen.getByText('STATUS')).toBeInTheDocument();
    expect(screen.getByText('ACCOUNTS')).toBeInTheDocument();
    expect(screen.getByText('Organization 1')).toBeInTheDocument();

    const switchElement = screen.getAllByRole('checkbox');
    expect(switchElement[0]).toBeInTheDocument();
    expect(switchElement[0]).toBeChecked();
  });

  test('handles switch change', () => {
    render(<FeatureFlagDetail />);
    const switchElement = screen.getAllByRole('checkbox');
    fireEvent.click(switchElement[0]);

    expect(mockFeatureFlagContext.upsertFeatureFlagByFlagId).toHaveBeenCalledWith(false, null);
  });
});
