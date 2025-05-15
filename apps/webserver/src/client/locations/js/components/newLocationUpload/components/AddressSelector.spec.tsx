import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldError } from 'react-hook-form';
import { AddressSelector } from './AddressSelector';

jest.mock('lodash.debounce', () => jest.fn((fn) => fn));

describe('AddressSelector', () => {
  const mockOnResultSelect = jest.fn();
  const mockOnClearValue = jest.fn();
  const user = userEvent.setup();

  const renderComponent = (error?: FieldError) => {
    render(
      <AddressSelector
        onResultSelect={mockOnResultSelect}
        onClearValue={mockOnClearValue}
        error={error}
      />
    );
  };

  afterEach(cleanup);

  test('renders input field and no error by default', () => {
    renderComponent();

    const inputField = screen.getByRole('combobox');
    expect(inputField).toBeInTheDocument();
    expect(screen.queryByText('Enter a valid address')).not.toBeInTheDocument();
  });

  test('displays error message when error is provided', () => {
    renderComponent({ message: 'Invalid address', type: 'required' });

    expect(screen.getByText('Enter a valid address')).toBeInTheDocument();
  });

  test('fetches suggestions when typing in the input field', async () => {
    renderComponent();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            suggestions: [{ text: '123 Main St' }, { text: '456 Elm St' }],
          }),
      })
    ) as jest.Mock;

    const inputField = screen.getByRole('combobox');
    await user.type(inputField, 'St');

    expect(global.fetch).toHaveBeenCalled();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest'
      )
    );

    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText('456 Elm St')).toBeInTheDocument();
  });

  test('clears suggestions and calls onClearValue when input is cleared', async () => {
    renderComponent();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            suggestions: [{ text: '123 Main St' }],
          }),
      })
    ) as jest.Mock;

    const inputField = screen.getByRole('combobox');
    await user.type(inputField, '123');

    expect(screen.getByText('123 Main St')).toBeInTheDocument();

    await user.clear(inputField);

    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
    expect(mockOnClearValue).toHaveBeenCalled();
  });

  test('fetches coordinates when an option is selected', async () => {
    renderComponent();

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            suggestions: [{ text: '123 Main St' }],
          }),
      })
    );

    const inputField = screen.getByRole('combobox');
    await user.type(inputField, '123');
    expect(screen.getByText('123 Main St')).toBeInTheDocument();

    global.fetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            candidates: [
              {
                location: {
                  x: -122.4194,
                  y: 37.7749,
                },
              },
            ],
          }),
      })
    );

    await user.click(screen.getByText('123 Main St'));
    expect(global.fetch).toHaveBeenCalled();
    expect(mockOnResultSelect).toHaveBeenCalledWith(37.7749, -122.4194);
  }, 10100);

  test('displays no suggestions when fetch fails', async () => {
    renderComponent();

    global.fetch = jest.fn(() => Promise.reject(new Error('API Error'))) as jest.Mock;

    const inputField = screen.getByRole('combobox');
    await user.type(inputField, '123');

    expect(global.fetch).toHaveBeenCalled();
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument();
  });
});
