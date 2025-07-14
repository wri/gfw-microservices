import { render, screen, fireEvent } from '@testing-library/react';

import LocationsSummary from './LocationsSummary';
import { ThemeProvider } from '../../../../../styles/ThemeProvider';

jest.mock('../../../../../hooks', () => ({
  useTransifexTranslation: jest.fn((key) => key),
}));

describe('LocationsSummary', () => {
  const defaultProps = {
    anchorElCountries: null,
    closeCountriesPopover: jest.fn(),
    countries: ['Brazil', 'Colombia', 'Peru', 'Argentina'],
    filterValues: { Brazil: true, Colombia: true },
    listLocationsCount: 2,
    openCountriesPopover: false,
    selectedList: {
      isGlobalForestWatchList: false,
      list_locations_count: 4,
    },
    shareView: true,
    toggleCountriesPopover: jest.fn(),
    numberOfResults: 3,
  };

  const renderWithTheme = (component) => render(<ThemeProvider>{component}</ThemeProvider>);

  it('renders the correct location and country summary', () => {
    const { container } = renderWithTheme(<LocationsSummary {...defaultProps} />);
    expect(container.textContent).toContain('Showing 3 of 4 total locations');
    expect(container.textContent).toContain('Brazil, Colombia, Peru');
  });

  it('displays the popover when the country list is clicked', () => {
    renderWithTheme(<LocationsSummary {...defaultProps} />);

    const countrySummary = screen.getByText('Brazil, Colombia, Peru…');
    fireEvent.click(countrySummary);

    expect(defaultProps.toggleCountriesPopover).toHaveBeenCalled();
  });

  it('does not display the share icon when shareView is false', () => {
    renderWithTheme(<LocationsSummary {...defaultProps} shareView={false} />);

    expect(screen.queryByTestId('icon-share')).not.toBeInTheDocument();
    expect(screen.queryByText('locationsPage.lists.share')).not.toBeInTheDocument();
  });
});
