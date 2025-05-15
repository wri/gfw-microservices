import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import FeatureFlagsList from './FeatureFlagsList';
import { useFeatureFlagStateContext } from './FeatureFlagStateContext';
import moment from 'moment/moment';

jest.mock('./FeatureFlagStateContext');

afterEach(cleanup);

describe('FeatureFlagsList', () => {
  it('renders FeatureFlagsList component', () => {
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
      const formattedDate = moment(flag.updateDateTime).format('MM/DD/YYYY - HH:mm');

      expect(screen.getByText(formattedDate)).toBeInTheDocument();
    });
  });

  it('selects a feature flag on click', () => {
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
});
