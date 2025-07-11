import { render, screen, fireEvent } from '@testing-library/react';
import AnalysesTabs from './AnalysesTabs';
import { analysisTypes } from '../../../../../../config/env/analysisTypes.constants';
import {
  COMMODITY_RISK_VIEW,
  FOREST_CHANGE_VIEW,
  POST_2020_RISK_ASSESSMENT_VIEW,
} from './listViews.constants';

const mockChangeListView = jest.fn();

const defaultProps = {
  listView: POST_2020_RISK_ASSESSMENT_VIEW,
  changeListView: mockChangeListView,
  listViewOptions: [POST_2020_RISK_ASSESSMENT_VIEW, FOREST_CHANGE_VIEW, COMMODITY_RISK_VIEW],
  listAnalysesStatus: [
    { analysisId: analysisTypes.FOREST_CHANGE_DIAGNOSTICS, status: 'Pending' },
    { analysisId: analysisTypes.DEFORESTATION_KPIS, status: 'Inactive' },
  ],
  hasLocationWithErrors: false,
};

describe('AnalysesTabs', () => {
  it('renders all tabs', () => {
    render(<AnalysesTabs {...defaultProps} />);
    expect(screen.getByText('Palm Risk Assessment')).toBeInTheDocument();
    expect(screen.getByText('Post-2020 Risk Assessment')).toBeInTheDocument();
    expect(screen.getByText('Post-2000 Forest Change')).toBeInTheDocument();
  });

  it('calls changeListView when a tab is clicked', () => {
    render(<AnalysesTabs {...defaultProps} />);
    fireEvent.click(screen.getByText('Palm Risk Assessment'));
    expect(mockChangeListView).toHaveBeenCalledWith(COMMODITY_RISK_VIEW);
  });
});
