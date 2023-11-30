import { StateMock } from '@react-mock/state';
import { render, cleanup } from '@testing-library/react';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from 'react';

import { locationsPage } from '../../common/js/config';
import CommodityRiskFilter from '../../listDetails/js/components/lists/CommodityRiskFilter';

import { LIST_DATA_BRAZIL } from './test-config';

describe('Test List Section Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

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
    const myState = { ...locationsPage.defaultFilterValues };

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
    const myState = { ...locationsPage.defaultFilterValues };

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
});
