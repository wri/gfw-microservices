import { render, screen, fireEvent } from '@testing-library/react';

import LocationsSummary from './LocationsSummary';

jest.mock('../../../../../hooks', () => ({
  useTransifexTranslation: jest.fn((key) => key),
}));

describe('LocationsSummary', () => {
  const defaultProps = {
    anchorElCountries: null,
    onClose: jest.fn(),
    countries: ['Brazil', 'Colombia', 'Peru', 'Argentina'],
    filterValues: { Brazil: true, Colombia: true },
    listLocationsCount: 2,
    isOpen: false,
    selectedList: {
      isGlobalForestWatchList: false,
      list_locations_count: 4,
    },
    shareView: true,
    onOpen: jest.fn(),
    numberOfResults: 3,
  };

  it('renders the correct location and country summary', () => {
    const { container } = render(<LocationsSummary {...defaultProps} />);
    expect(container.textContent).toContain('Showing 3 of 4 total locations');
    expect(container.textContent).toContain('Brazil, Colombia, Peru');
  });

  it('displays the popover when the country list is clicked', () => {
    render(<LocationsSummary {...defaultProps} />);

    const countrySummary = screen.getByText('Brazil, Colombia, Peru…');
    fireEvent.click(countrySummary);

    expect(defaultProps.onOpen).toHaveBeenCalled();
  });

  it('does not display the share icon when shareView is false', () => {
    render(<LocationsSummary {...defaultProps} shareView={false} />);

    expect(screen.queryByTestId('icon-share')).not.toBeInTheDocument();
    expect(screen.queryByText('locationsPage.lists.share')).not.toBeInTheDocument();
  });
});
