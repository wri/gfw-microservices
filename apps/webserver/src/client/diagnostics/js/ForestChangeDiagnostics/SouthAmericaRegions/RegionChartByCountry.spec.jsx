import { render, screen, waitFor } from '@testing-library/react';
import { RegionChartByCountry } from './RegionChartByCountry';
import { regionIds } from './regions-constants';
import { BrowserRouter } from 'react-router-dom';
import { MOCK_COUNTRY_DATA } from './mockCountryData';

jest.mock('../../../../common/js/hooks', () => ({
  useQuery: () => ({
    get: () => '1',
  }),
}));

jest.mock(
  '../../../../diagnostics/js/ForestChangeDiagnostics/SouthAmericaRegions/DateRangeSlider',
  () => () => <div>DateRangeSlider Component</div>
);
jest.mock('../../../../diagnostics/js/common/BarChart', () => () => <div>BarChart Component</div>);
jest.mock('../../../../diagnostics/js/common/PieChart', () => ({ title }) => (
  <div>PieChart Component - {title}</div>
));
jest.mock(
  '../../../../diagnostics/js/ForestChangeDiagnostics/SouthAmericaRegions/ChartsSelectorArgentina',
  () => () => <div>ChartsSelectorArgentina Component</div>
);
jest.mock('../../../../diagnostics/js/common/DiagnosticsChartHeader', () => () => (
  <div>DiagnosticsChartHeader Component</div>
));

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        WDPA: { country_specific_deforestation: { fullyRestrictive: 1, lessRestrictive: 2 } },
        landmark: {},
      }),
    ok: true,
  })
);

describe('RegionChartByCountry - Argentina', () => {
  it('should render pie charts for protected areas and indigenous territories', async () => {
    const defaultProps = {
      listId: '1',
      data: MOCK_COUNTRY_DATA,
      fireDownload: jest.fn(),
      country: regionIds.ARGENTINA,
    };

    render(
      <BrowserRouter>
        <RegionChartByCountry {...defaultProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('DiagnosticsChartHeader Component')).toBeInTheDocument();
      expect(screen.getByText('DateRangeSlider Component')).toBeInTheDocument();
      expect(screen.getByText('BarChart Component')).toBeInTheDocument();
      expect(screen.getByText('ChartsSelectorArgentina Component')).toBeInTheDocument();
      expect(screen.getByText('PieChart Component - OTBN Overlap')).toBeInTheDocument();
      expect(screen.queryByText('PieChart Component - Protected Areas Overlap')).not.toBeNull();
      expect(
        screen.queryByText('PieChart Component - Indigenous Territories Overlap')
      ).not.toBeNull();
    });
  });

  it('should NOT render pie charts for protected areas and indigenous territories', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      })
    );

    const defaultProps = {
      listId: '1',
      data: MOCK_COUNTRY_DATA,
      fireDownload: jest.fn(),
      country: regionIds.ARGENTINA,
    };

    render(
      <BrowserRouter>
        <RegionChartByCountry {...defaultProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('DiagnosticsChartHeader Component')).toBeInTheDocument();
      expect(screen.getByText('DateRangeSlider Component')).toBeInTheDocument();
      expect(screen.getByText('BarChart Component')).toBeInTheDocument();
      expect(screen.getByText('ChartsSelectorArgentina Component')).toBeInTheDocument();
      expect(screen.getByText('PieChart Component - OTBN Overlap')).toBeInTheDocument();
      expect(
        screen.queryByText('PieChart Component - Protected Areas Overlap')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('PieChart Component - Indigenous Territories Overlap')
      ).not.toBeInTheDocument();
    });
  });
});

describe('RegionChartByCountry - Colombia', () => {
  it('should render pie charts for protected areas and indigenous territories', async () => {
    const defaultProps = {
      listId: '1',
      data: MOCK_COUNTRY_DATA,
      fireDownload: jest.fn(),
      country: regionIds.COLOMBIA,
    };

    render(
      <BrowserRouter>
        <RegionChartByCountry {...defaultProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('DateRangeSlider Component')).toBeNull();
      expect(screen.queryByText('ChartsSelectorArgentina Component')).toBeNull();
      expect(screen.queryByText('PieChart Component - OTBN Overlap')).toBeNull();

      expect(screen.queryByText('DiagnosticsChartHeader Component')).not.toBeNull();
      expect(screen.queryByText('BarChart Component')).not.toBeNull();
      expect(screen.queryByText('PieChart Component - Protected Areas Overlap')).not.toBeNull();

      expect(
        screen.queryByText('PieChart Component - Indigenous Territories Overlap')
      ).not.toBeNull();
    });
  });

  it('should NOT render pie charts for protected areas and indigenous territories', async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({
        json: () => Promise.resolve({}),
        ok: true,
      })
    );

    const defaultProps = {
      listId: '1',
      data: MOCK_COUNTRY_DATA,
      fireDownload: jest.fn(),
      country: regionIds.COLOMBIA,
    };

    render(
      <BrowserRouter>
        <RegionChartByCountry {...defaultProps} />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText('DateRangeSlider Component')).toBeNull();
      expect(screen.queryByText('ChartsSelectorArgentina Component')).toBeNull();
      expect(screen.queryByText('PieChart Component - OTBN Overlap')).toBeNull();

      expect(screen.queryByText('DiagnosticsChartHeader Component')).not.toBeNull();
      expect(
        screen.queryByText('PieChart Component - Protected Areas Overlap')
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText('PieChart Component - Indigenous Territories Overlap')
      ).not.toBeInTheDocument();
    });
  });
});
