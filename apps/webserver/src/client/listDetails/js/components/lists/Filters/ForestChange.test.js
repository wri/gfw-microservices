import React from 'react';
import { render, screen } from '@testing-library/react';
import { ForestChangeFilterDrawer } from './ForestChange';

// Mock child components
jest.mock('../GFWForestChangeFilter', () => () => <div>GFWForestChangeFilter</div>);
jest.mock('../GFWAdminForestChangeFilter', () => () => <div>GFWAdminForestChangeFilter</div>);
jest.mock('../GFWProtectedForestChangeFilter', () => () => (
  <div>GFWProtectedForestChangeFilter</div>
));
jest.mock('../ForestChangeFilter', () => () => <div>ForestChangeFilter</div>);

describe('ForestChangeFilterDrawer', () => {
  const defaultProps = {
    listName: '',
    listData: [],
    filterCount: 0,
    listView: 'grid',
    adminAreas: [],
    history: [],
    protectedAreas: [],
    filterValues: {},
    maximumAnalysisAreaInTheList: 100,
    clearFilters: jest.fn(),
  };

  it('should render GFWForestChangeFilter when listName is in FOREST_CHANGE_FILTER_LIST', () => {
    const props = {
      ...defaultProps,
      listName: 'Oil Palm Concessions',
    };
    render(<ForestChangeFilterDrawer {...props} />);
    expect(screen.getByText('GFWForestChangeFilter')).toBeInTheDocument();
  });

  it('should render GFWAdminForestChangeFilter when listName is "Administrative Areas"', () => {
    const props = {
      ...defaultProps,
      listName: 'Administrative Areas',
    };
    render(<ForestChangeFilterDrawer {...props} />);
    expect(screen.getByText('GFWAdminForestChangeFilter')).toBeInTheDocument();
  });

  it('should render GFWProtectedForestChangeFilter when listName is "Protected Areas"', () => {
    const props = {
      ...defaultProps,
      listName: 'Protected Areas',
    };
    render(<ForestChangeFilterDrawer {...props} />);
    expect(screen.getByText('GFWProtectedForestChangeFilter')).toBeInTheDocument();
  });

  it('should render ForestChangeFilter by default when listName does not match any case', () => {
    const props = {
      ...defaultProps,
      listName: 'Unknown List',
    };
    render(<ForestChangeFilterDrawer {...props} />);
    expect(screen.getByText('ForestChangeFilter')).toBeInTheDocument();
  });
});
