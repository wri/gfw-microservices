import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
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
  let user: UserEvent;
  const setUploadLocationByPoint = jest.fn();
  const clearUploadType = jest.fn();

  beforeEach(() => {
    user = userEvent.setup();
    (useUploadLocation as jest.Mock).mockReturnValue({
      clearUploadType,
      setUploadLocationByPoint,
    });
    render(<UploadLocationByPoint />);
  });

  afterEach(cleanup);

  it('should validate mandatory fields for coordinates location type', async () => {
    await user.click(
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

    await user.click(
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
  }, 10100);

  it('should validate mandatory fields for address location type', async () => {
    await user.click(
      screen.getByRole('button', {
        name: /enter address/i,
      })
    );

    expect(screen.queryByText(/enter location name/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/enter the area size/i)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    expect(screen.getByText(/enter location name/i)).toBeInTheDocument();
    expect(screen.getByText(/enter the area size/i)).toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalled();
  }, 10100);

  describe('location name validation', () => {
    beforeEach(async () => {
      await user.click(
        screen.getByRole('button', {
          name: /enter address/i,
        })
      );
    });

    it('should show error for special characters in location name', async () => {
      const locationName = screen.getByRole('textbox');
      await user.type(locationName, 'location name with special char #');

      await user.click(
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
      await user.type(locationName, ' location name with leading space');

      await user.click(
        screen.getByRole('button', {
          name: /next/i,
        })
      );

      expect(screen.queryByText(/leading or trailing spaces are not allowed/i)).toBeInTheDocument();
    });

    it('should not show error for a valid location name', async () => {
      const locationName = screen.getByRole('textbox');
      await user.type(locationName, 'valid location name');

      await user.click(
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
    await user.click(screen.getByRole('button', { name: /enter coordinates/i }));

    await user.type(screen.getByRole('spinbutton', { name: /latitude/i }), '12.3456');
    await user.type(screen.getByRole('spinbutton', { name: /longitude/i }), '-45.6789');
    await user.type(screen.getByRole('textbox'), 'Test Location');

    const view = screen.getByTestId('area-size');
    const areaSize = within(view).getByRole('spinbutton');
    await user.type(areaSize, '100');

    const viewDistanceMetrics = screen.getByTestId('hectare-kilometer-switch');
    await user.click(within(viewDistanceMetrics).getByText(/km/i));

    await user.click(
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
    await user.click(
      screen.getByRole('button', {
        name: /cancel/i,
      })
    );
    expect(clearUploadType).toHaveBeenCalled();
  });

  it('should load the text for suggested area according to measurement unit', async () => {
    await user.click(
      screen.getByRole('button', {
        name: /enter coordinates/i,
      })
    );

    expect(screen.getByText(/suggested areas:/i)).toBeInTheDocument();

    expect(screen.queryByText(/50 km for palm oil mills/i)).toBeNull();
    expect(screen.queryByText(/785,000 hectares for palm oil mills/i)).not.toBeNull();
    expect(screen.getByText(/283,000 hectares for soy silos/i)).toBeInTheDocument();
    expect(screen.getByText(/80-102,000 hectares for cocoa warehouses/i)).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /km/i,
      })
    );

    expect(screen.queryByText(/785,000 hectares for palm oil mills/i)).toBeNull();
    expect(screen.queryByText(/50 km for palm oil mills/i)).not.toBeNull();
    expect(screen.getByText(/30 km for soy silos/i)).toBeInTheDocument();
    expect(screen.getByText(/0.5-18 km for cocoa warehouses/i)).toBeInTheDocument();
  });
});
