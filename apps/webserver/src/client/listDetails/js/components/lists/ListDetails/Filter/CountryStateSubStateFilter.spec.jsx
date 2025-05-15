import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CountryStateSubStateFilter from './CountryStateSubStateFilter';

describe('CountryStateSubStateFilter', () => {
  afterEach(() => {
    cleanup();
  });
  const mockOnCountryChange = jest.fn();
  const mockOnStateChange = jest.fn();
  const mockOnSubStateChange = jest.fn();

  const mockCountries = ['USA', 'Canada'];
  const mockStates = ['California', 'Texas'];
  const mockSubStates = ['Los Angeles', 'Houston'];

  it('renders correctly with initial props', () => {
    render(
      <CountryStateSubStateFilter
        countries={mockCountries}
        selectedCountry=""
        onCountryChange={mockOnCountryChange}
        states={mockStates}
        selectedState=""
        onStateChange={mockOnStateChange}
        subStates={mockSubStates}
        selectedSubState=""
        onSubStateChange={mockOnSubStateChange}
      />
    );

    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    const stateLabels = screen.getAllByLabelText(/State/i);
    expect(stateLabels[0]).toBeInTheDocument();
  });

  it('allows selecting a country', () => {
    render(
      <CountryStateSubStateFilter
        countries={mockCountries}
        selectedCountry=""
        onCountryChange={mockOnCountryChange}
        states={mockStates}
        selectedState=""
        onStateChange={mockOnStateChange}
        subStates={mockSubStates}
        selectedSubState=""
        onSubStateChange={mockOnSubStateChange}
      />
    );
    const countrySelect = screen.getByLabelText(/Country/i);

    fireEvent.mouseDown(countrySelect);
    const usaOption = screen.getByRole('option', { name: /USA/i });
    fireEvent.click(usaOption);
    expect(mockOnCountryChange).toHaveBeenCalled();
  });
  it('disables state and substate selects if no country is selected', () => {
    render(
      <CountryStateSubStateFilter
        countries={mockCountries}
        selectedCountry=""
        onCountryChange={mockOnCountryChange}
        states={mockStates}
        selectedState=""
        onStateChange={mockOnStateChange}
        subStates={mockSubStates}
        selectedSubState=""
        onSubStateChange={mockOnSubStateChange}
      />
    );

    const comboboxes = screen.getAllByRole('combobox', { name: /State/i });
    expect(comboboxes[0]).toHaveAttribute('aria-disabled', 'true');

    const subStateComboboxes = screen.getAllByRole('combobox', { name: /Sub State/i });
    expect(subStateComboboxes[0]).toHaveAttribute('aria-disabled', 'true');
  });
});
