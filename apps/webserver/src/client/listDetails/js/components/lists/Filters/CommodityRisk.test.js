import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { CommodityRiskFilterDrawer } from './CommodityRisk';
import { gfwListNames } from '../../../../../common/js/constants/lists.constants';

jest.mock('../GFWCommodityRiskFilter', () => () => <div data-testid="gfw-filter" />);
jest.mock('../CommodityRiskFilter', () => () => <div data-testid="commodity-filter" />);

describe('CommodityRiskFilterDrawer', () => {
  const defaultProps = {
    listData: [],
    filterCount: 0,
    listView: 'grid',
    clearFilters: jest.fn(),
  };

  afterEach(() => {
    cleanup();
  });

  test('renders GFWCommodityRiskFilter when listName matches PALM_OIL_INDEX', () => {
    render(<CommodityRiskFilterDrawer {...defaultProps} listName={gfwListNames[2]} />);

    expect(screen.getByTestId('gfw-filter')).toBeInTheDocument();
    expect(screen.queryByTestId('commodity-filter')).not.toBeInTheDocument();
  });

  test('renders CommodityRiskFilter when listName does not match PALM_OIL_INDEX', () => {
    render(<CommodityRiskFilterDrawer {...defaultProps} listName="SomeOtherList" />);
    expect(screen.getByTestId('commodity-filter')).toBeInTheDocument();
    expect(screen.queryByTestId('gfw-filter')).not.toBeInTheDocument();
  });
});
