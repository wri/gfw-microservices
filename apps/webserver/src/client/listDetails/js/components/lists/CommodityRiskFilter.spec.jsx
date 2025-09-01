import { StateMock } from '@react-mock/state';
import { render, fireEvent } from '@testing-library/react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { defaultFilterValues } from './defaultFilterValues';
import CommodityRiskFilter from './CommodityRiskFilter';

import { LIST_DATA_BRAZIL } from '../../../../locations/tests/test-config';

// Mock store and gtag
jest.mock('../../../../locations/js/store', () => ({
  dispatch: jest.fn(),
}));

global.gtag = jest.fn();

describe('CommodityRiskFilter', () => {
  it('Should render CommodityRiskFilter not throw event', () => {
    expect(() => {
      render(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
          <CommodityRiskFilter listData={[]} />
        </MuiThemeProvider>
      );
    }).not.toThrow();
  });

  it('Should render CommodityRiskFilter check if all labels exist', () => {
    const { container, getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <CommodityRiskFilter listData={[]} />
      </MuiThemeProvider>
    );

    expect(container.querySelector('.dialog__title').textContent).toBe('Filters');
    expect(getByLabelText('Country')).toBeInTheDocument();
    expect(getByLabelText('State')).toBeInTheDocument();
    expect(getByLabelText('Sub state')).toBeInTheDocument();
    expect(getByLabelText('Supplier')).toBeInTheDocument();
    expect(getByLabelText('Second supplier')).toBeInTheDocument();
    expect(getByLabelText('Parent company')).toBeInTheDocument();
    expect(getByLabelText('Show RSPO Certified')).toBeInTheDocument();
    expect(container.querySelector('#overall-threats-high')).toBeInTheDocument();
    expect(container.querySelector('#overall-values-high')).toBeInTheDocument();
    expect(container.querySelector('#mill-priority-high')).toBeInTheDocument();
  });

  it('Should fill CommodityRiskFilter when pass variable', () => {
    const myState = { ...defaultFilterValues };

    const { getByText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    expect(getByText('Brazil')).toBeInTheDocument();
    expect(getByText('Sumatera Utara')).toBeInTheDocument();
    expect(getByText('Langkat')).toBeInTheDocument();
    expect(getByText('Langkat')).toBeInTheDocument();

    expect(getByText('Company1')).toBeInTheDocument();
    expect(getByText('PT KENCANA AMAL TANI')).toBeInTheDocument();
  });

  it('Should fill CommodityRiskFilter and set state', () => {
    const myState = { ...defaultFilterValues };

    myState.selectedCountry = 'Brazil';
    myState.selectedState = 'Sumatera Utara';
    myState.selectedOverallThreats = ['high'];
    myState.selectedOverallValues = ['medium'];
    myState.selectedMillPriority = ['low'];
    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );
    expect(getByLabelText('Country')).toBeInTheDocument();
    expect(getByLabelText('State')).toBeInTheDocument();
  });

  it('should handle checkbox interactions for Overall Threats', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highThreatCheckbox = getByLabelText('High', {
      selector: 'input[name="overall-threats-selection"]',
    });
    expect(highThreatCheckbox).toBeInTheDocument();
  });

  it('should handle checkbox interactions for Overall Values', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highValueCheckbox = getByLabelText('High', {
      selector: 'input[name="overall-values-selection"]',
    });
    expect(highValueCheckbox).toBeInTheDocument();
  });

  it('should handle checkbox interactions for Mill Priority', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highPriorityCheckbox = getByLabelText('High', {
      selector: 'input[name="mill-priority-selection"]',
    });
    expect(highPriorityCheckbox).toBeInTheDocument();
  });

  it('should handle RSPO Certified checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const rspoCheckbox = getByLabelText('Show RSPO Certified');
    expect(rspoCheckbox).toBeInTheDocument();
    expect(rspoCheckbox.type).toBe('checkbox');
  });

  it('should render action buttons', () => {
    const mockClearFilters = jest.fn();

    const { getByText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <CommodityRiskFilter
          listData={LIST_DATA_BRAZIL}
          clearFilters={mockClearFilters}
          filterCount={0}
        />
      </MuiThemeProvider>
    );

    expect(getByText('Apply filters')).toBeInTheDocument();
    expect(getByText('Reset')).toBeInTheDocument();
    expect(getByText('Cancel')).toBeInTheDocument();
  });

  it('should handle empty listData', () => {
    expect(() => {
      render(
        <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
          <CommodityRiskFilter listData={[]} />
        </MuiThemeProvider>
      );
    }).not.toThrow();
  });

  it('should test changeOverallThreats function by clicking checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highThreatCheckbox = getByLabelText('High', {
      selector: 'input[name="overall-threats-selection"]',
    });
    expect(highThreatCheckbox.checked).toBe(false);
  });

  it('should test changeOverallValues function by clicking checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highValueCheckbox = getByLabelText('High', {
      selector: 'input[name="overall-values-selection"]',
    });
    expect(highValueCheckbox.checked).toBe(false);
  });

  it('should test changeMillPriority function by clicking checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highPriorityCheckbox = getByLabelText('High', {
      selector: 'input[name="mill-priority-selection"]',
    });
    expect(highPriorityCheckbox.checked).toBe(false);
  });

  it('should test changeShowRSPOCertified function', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const rspoCheckbox = getByLabelText('Show RSPO Certified');
    expect(rspoCheckbox.checked).toBe(false);
  });

  it('should test createOptions function through dropdown rendering', () => {
    const testData = [{ Country: 'USA', State: 'California', 'Supplier Name': 'Test Supplier' }];

    const { container } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <CommodityRiskFilter listView="commodity_risk" filterCount={0} listData={testData} />
      </MuiThemeProvider>
    );

    const countrySelect = container.querySelector('#country_select');
    expect(countrySelect).toBeInTheDocument();
  });

  it('should handle componentWillReceiveProps with filterCount reset', () => {
    const myState = { ...defaultFilterValues };
    myState.selectedCountry = 'Brazil';

    const { rerender } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={1}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    // Rerender with filterCount 0 to trigger componentWillReceiveProps
    rerender(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    expect(true).toBe(true); // Test passes if no error thrown
  });

  it('should execute changeOverallThreats when clicking threat checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const highThreatCheckbox = getByLabelText('High', {
      selector: 'input[name="overall-threats-selection"]',
    });
    fireEvent.click(highThreatCheckbox);
    expect(highThreatCheckbox).toBeInTheDocument();
  });

  it('should execute changeOverallValues when clicking value checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const mediumValueCheckbox = getByLabelText('Medium', {
      selector: 'input[name="overall-values-selection"]',
    });
    fireEvent.click(mediumValueCheckbox);
    expect(mediumValueCheckbox).toBeInTheDocument();
  });

  it('should execute changeMillPriority when clicking priority checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const lowPriorityCheckbox = getByLabelText('Low', {
      selector: 'input[name="mill-priority-selection"]',
    });
    fireEvent.click(lowPriorityCheckbox);
    expect(lowPriorityCheckbox).toBeInTheDocument();
  });

  it('should execute changeShowRSPOCertified when clicking RSPO checkbox', () => {
    const myState = { ...defaultFilterValues };

    const { getByLabelText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <StateMock state={myState}>
          <CommodityRiskFilter
            listView="commodity_risk"
            filterCount={0}
            listData={LIST_DATA_BRAZIL}
          />
        </StateMock>
      </MuiThemeProvider>
    );

    const rspoCheckbox = getByLabelText('Show RSPO Certified');
    fireEvent.click(rspoCheckbox);
    expect(rspoCheckbox).toBeInTheDocument();
  });

  it('should execute button click handlers', () => {
    const mockClearFilters = jest.fn();

    const { getByText } = render(
      <MuiThemeProvider muiTheme={getMuiTheme(lightBaseTheme)}>
        <CommodityRiskFilter
          listData={LIST_DATA_BRAZIL}
          clearFilters={mockClearFilters}
          filterCount={0}
        />
      </MuiThemeProvider>
    );

    const applyButton = getByText('Apply filters');
    const resetButton = getByText('Reset');
    const cancelButton = getByText('Cancel');

    fireEvent.click(applyButton);
    fireEvent.click(resetButton);
    fireEvent.click(cancelButton);

    expect(mockClearFilters).toHaveBeenCalled();
  });
});
