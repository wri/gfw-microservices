import React from 'react';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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
  beforeEach(() => {
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
  });

  afterEach(() => {
    cleanup();
  });

  it('should render the component with form elements', async () => {
    render(<UploadLocationByPolygon />);

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
    render(<UploadLocationByPolygon />);

    const locationNameField = screen.getByRole('textbox');
    await userEvent.type(locationNameField, 'new location 123');

    await userEvent.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );

    await userEvent.type(screen.getAllByLabelText(/latitude/i)[0], '89.9999');
    await userEvent.type(screen.getAllByLabelText(/longitude/i)[0], '179.99999');
    await userEvent.type(screen.getAllByLabelText(/latitude/i)[1], '-89.9999');
    await userEvent.type(screen.getAllByLabelText(/longitude/i)[1], '-179.99999');
    await userEvent.type(screen.getAllByLabelText(/latitude/i)[2], '48.34233');
    await userEvent.type(screen.getAllByLabelText(/longitude/i)[2], '-12.3456');

    await userEvent.click(
      screen.getByRole('button', {
        name: /ok/i,
      })
    );

    await userEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );
    expect(mockHistoryPush).toHaveBeenCalledWith('CONFIGURE_LIST');
  }, 10000);

  it('should show missing mandatory fields', async () => {
    render(<UploadLocationByPolygon />);

    await userEvent.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );
    expect(screen.queryByText(/enter the location name/i)).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );
    expect(screen.queryByText(/enter the location name/i)).toBeInTheDocument();

    const locationNameField = screen.getByRole('textbox');
    await userEvent.type(locationNameField, 'new location 123');
    expect(screen.queryByText(/enter the location name/i)).not.toBeInTheDocument();

    expect(
      screen.queryAllByText(
        /your coordinate value is invalid\. please ensure your data is in decimal degree notation/i
      )
    ).toHaveLength(0);

    await userEvent.click(
      screen.getByRole('button', {
        name: /next/i,
      })
    );

    expect(
      screen.queryAllByText(
        /your coordinate value is invalid\. please ensure your data is in decimal degree notation/i
      )
    ).toHaveLength(6);
  });

  it('should allow adding and removing coordinate fields', async () => {
    render(<UploadLocationByPolygon />);

    await userEvent.click(
      screen.getByRole('button', {
        name: /enter polygon coordinates/i,
      })
    );

    expect(screen.getAllByLabelText(/longitude/i)).toHaveLength(3);

    await userEvent.click(
      screen.getByRole('button', {
        name: /add/i,
      })
    );

    expect(screen.getAllByLabelText(/longitude/i)).toHaveLength(4);

    await userEvent.click(screen.getAllByRole('button')[2]);
    await waitFor(() => expect(screen.getAllByLabelText(/longitude/i)).toHaveLength(3));
  });

  it('should call clearUploadType on cancel', async () => {
    render(<UploadLocationByPolygon />);

    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockClearUploadType).toHaveBeenCalled();
  });
});
