import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UploadLocationByPoint } from './UploadLocationByPoint';
import { useUploadLocation } from '../contexts';

const mockHistoryPush = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock('../contexts', () => ({
  useUploadLocation: jest.fn(),
}));

jest.mock('../components', () => {
  const { LocationTypeButton } = jest.requireActual('../components');
  return {
    LocationTypeButton,
    NavBar: () => <span />,
    ExternalHelperResource: () => <span />,
    AddressSelector: () => <span />,
  };
});

describe('UploadLocationByPoint', () => {
  const setUploadLocationByPoint = jest.fn();
  const clearUploadType = jest.fn();

  beforeEach(() => {
    (useUploadLocation as jest.Mock).mockReturnValue({
      clearUploadType,
      setUploadLocationByPoint,
    });
    render(<UploadLocationByPoint />);
  });

  afterEach(cleanup);

  it('should validate mandatory fields for coordinates location type', async () => {
    await userEvent.click(
      screen.getByRole('button', {
        name: /enter coordinates/i,
      })
    );

    expect(screen.queryByText(/enter location name/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /this latitude is invalid\. please ensure your it is in decimal degree notation/i
      )
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /this longitude is invalid\. please ensure your it is in decimal degree notation/i
      )
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/enter the area size/i)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    expect(screen.getByText(/enter location name/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /this latitude is invalid\. please ensure your it is in decimal degree notation/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /this longitude is invalid\. please ensure your it is in decimal degree notation/i
      )
    ).toBeInTheDocument();
    expect(screen.getByText(/enter the area size/i)).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  it('should validate mandatory fields for address location type', async () => {
    await userEvent.click(
      screen.getByRole('button', {
        name: /enter address/i,
      })
    );

    expect(screen.queryByText(/enter location name/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enter the area size/i)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    expect(screen.getByText(/enter location name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter the area size/i)).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();
  });

  describe('location name validation', () => {
    beforeEach(async () => {
      await userEvent.click(
        screen.getByRole('button', {
          name: /enter address/i,
        })
      );
    });

    it('should show error for special characters in location name', async () => {
      const locationName = screen.getByRole('textbox');
      await userEvent.type(locationName, 'location name with special char #');

      await userEvent.click(
        screen.getByRole('button', {
          name: /next/i,
        })
      );

      expect(
        screen.queryByText(/only letters, numbers, spaces, and \[\]\(\)\.-_ are allowed/i)
      ).toBeInTheDocument();
    });

    it('should show error for leading or trailing spaces in location name', async () => {
      const locationName = screen.getByRole('textbox');
      await userEvent.type(locationName, ' location name with leading space');

      await userEvent.click(
        screen.getByRole('button', {
          name: /next/i,
        })
      );

      expect(screen.queryByText(/leading or trailing spaces are not allowed/i)).toBeInTheDocument();
    });

    it('should not show error for a valid location name', async () => {
      const locationName = screen.getByRole('textbox');
      await userEvent.type(locationName, 'valid location name');

      await userEvent.click(
        screen.getByRole('button', {
          name: /next/i,
        })
      );

      expect(
        screen.queryByText(/only letters, numbers, spaces, and \[\]\(\)\.-_ are allowed/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/leading or trailing spaces are not allowed/i)
      ).not.toBeInTheDocument();
    });
  });

  it('should submit valid data for coordinates', async () => {
    await userEvent.click(screen.getByRole('button', { name: /enter coordinates/i }));

    await userEvent.type(screen.getByRole('spinbutton', { name: /latitude/i }), '12.3456');
    await userEvent.type(screen.getByRole('spinbutton', { name: /longitude/i }), '-45.6789');
    await userEvent.type(screen.getByRole('textbox'), 'Test Location');

    const view = screen.getByTestId('area-size');
    const areaSize = within(view).getByRole('spinbutton');
    await userEvent.type(areaSize, '100');

    const viewDistanceMetrics = screen.getByTestId('hectare-kilometer-switch');
    await userEvent.click(within(viewDistanceMetrics).getByText(/km/i));

    await userEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    expect(setUploadLocationByPoint).toHaveBeenCalledWith({
      locationName: 'Test Location',
      coordinate: { latitude: 12.3456, longitude: -45.6789 },
      area: { size: 100, measurementUnit: 'kilometers' },
    });
    expect(mockHistoryPush).toHaveBeenCalledWith('CONFIGURE_LIST');
  }, 15100);

  it('should call clearUploadType when cancel button is clicked', async () => {
    await userEvent.click(
      screen.getByRole('button', {
        name: /cancel/i,
      })
    );
    expect(clearUploadType).toHaveBeenCalled();
  });
});
