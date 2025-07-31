import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { UploadLocationByPolygon } from './UploadLocationByPolygon';
import { useMap } from '../hooks';

jest.mock('../../adding/PolygonCoordinates/polygonCoordinates.utils', () => ({
  createGeometryAndGraphic: () => ({ geometry: jest.fn(), graphic: jest.fn() }),
}));

const mockHistoryPush = jest.fn();
jest.mock('../hooks', () => ({
  useMap: jest.fn(),
  useHistory: () => ({ push: mockHistoryPush }),
}));

const mockClearUploadType = jest.fn();
jest.mock('../contexts', () => ({
  useUploadLocation: () => ({
    setUploadLocationByPolygon: jest.fn(),
    selectUploadType: jest.fn(),
    clearUploadType: mockClearUploadType,
  }),
}));

jest.mock('../components', () => {
  const { LocationTypeButton } = jest.requireActual('../components');
  return {
    LocationTypeButton,
    NavBar: () => <span />,
    ExternalHelperResource: () => <span />,
  };
});

describe('UploadLocationByPolygon', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();

    (useMap as jest.Mock).mockImplementation(() => {
      const { useMap } = jest.requireActual('../hooks');

      return {
        ...useMap(false, 3),
        mapView: { on: jest.fn() },
        sketchViewModel: {
          update: jest.fn(),
          create: jest.fn(),
          remove: jest.fn(),
        },
        setSketchViewModel: jest.fn(),
        addGraphicToMap: jest.fn(),
      };
    });

    render(<UploadLocationByPolygon />);
  });

  it('should render the component with form elements', async () => {
    expect(
      screen.getByText(
        /gfw pro allows users to create polygon data for analysis view drawing a boundary on the map or defining a polygon via its coordinates vertices\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /draw a shape/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    ).toBeInTheDocument();
  });

  it('should go to next page if all fields are provided', async () => {
    const locationName = screen.getByRole('textbox');
    await user.type(locationName, 'new location 123');

    await user.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );

    const latitudeFields = screen.getAllByLabelText(/latitude/i);
    const longitudeFields = screen.getAllByLabelText(/longitude/i);

    await user.type(latitudeFields[0], '89.9999');
    await user.type(longitudeFields[0], '179.99999');
    await user.type(latitudeFields[1], '-89.9999');
    await user.type(longitudeFields[1], '-179.99999');
    await user.type(latitudeFields[2], '48');
    await user.type(longitudeFields[2], '-12');

    await user.click(
      screen.getByRole('button', {
        name: /ok/i,
      })
    );

    await user.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );
    expect(mockHistoryPush).toHaveBeenCalledWith('CONFIGURE_LIST');
  }, 50100);

  it('should show missing mandatory fields', async () => {
    await user.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );
    expect(screen.queryByText(/enter location name/i)).not.toBeInTheDocument();
    await user.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );
    expect(screen.getByText(/enter location name/i)).toBeInTheDocument();

    const locationName = screen.getByRole('textbox');
    await user.type(locationName, 'new location 123');
    expect(screen.queryByText(/enter location name/i)).not.toBeInTheDocument();

    expect(screen.queryAllByText(/this latitude value is invalid/i)).toHaveLength(0);
    expect(screen.queryAllByText(/this longitude value is invalid/i)).toHaveLength(0);

    await user.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    expect(screen.queryAllByText(/this latitude value is invalid/i)).toHaveLength(3);
    expect(screen.queryAllByText(/this longitude value is invalid/i)).toHaveLength(3);
  }, 15100);

  describe('location name validation', () => {
    beforeEach(async () => {
      await user.click(
        screen.getByRole('button', {
          name: /enter polygon coordinates/i,
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
    }, 15100);

    it('should show error for leading or trailing spaces in location name', async () => {
      const locationName = screen.getByRole('textbox');
      await user.type(locationName, ' location name with leading space');

      await user.click(
        screen.getByRole('button', {
          name: /next/i,
        })
      );

      expect(screen.queryByText(/leading or trailing spaces are not allowed/i)).toBeInTheDocument();
    }, 15100);

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
    }, 10100);
  });

  it('should allow adding and removing coordinate fields', async () => {
    await user.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );

    expect(screen.getAllByLabelText(/longitude/i)).toHaveLength(3);

    await user.click(
      screen.getByRole('button', {
        name: /add/i,
      })
    );

    expect(screen.getAllByLabelText(/longitude/i)).toHaveLength(4);

    await user.click(screen.getAllByRole('button')[2]);
    await waitFor(() => expect(screen.getAllByLabelText(/longitude/i)).toHaveLength(3));
  }, 15100);

  it('should call clearUploadType on cancel', async () => {
    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockClearUploadType).toHaveBeenCalled();
  });

  it('should show error for invalid latitude and longitude values', async () => {
    const locationName = screen.getByRole('textbox');
    await user.type(locationName, 'invalid coords location');

    await user.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );

    const latitudeFields = screen.getAllByLabelText(/latitude/i);
    const longitudeFields = screen.getAllByLabelText(/longitude/i);

    await user.type(latitudeFields[0], '90.01');
    await user.type(longitudeFields[0], '180.01');

    await user.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    screen.logTestingPlaygroundURL();

    expect(screen.queryAllByText(/this latitude value is invalid/i)).toHaveLength(3);
    expect(screen.queryAllByText(/this longitude value is invalid/i)).toHaveLength(3);
  }, 10100);
});
