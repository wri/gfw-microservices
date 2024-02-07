import React, { useState } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { render, fireEvent, waitFor, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import PolygonCoordinatesInput from './PolygonCoordinatesInput';
import * as geometries from './geometries';
import { NEW_LOCATION_AREA_OPTIONS } from '../areaOptions.constants';

jest.mock('./geometries');
jest.mock('esri/views/MapView');

jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn(),
      };
    }),
  };
});

jest.mock('../LocationMapDrawer', () => {
  return () => <div />;
});

jest.mock('@arcgis/core/Graphic', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        init: jest.fn(),
      };
    }),
  };
});
const mockMapView = {
  graphics: {
    removeAll: jest.fn(),
    add: jest.fn(),
  },
  goTo: jest.fn(),
};
const mockSketchViewModel = {
  delete: jest.fn(),
};

const mockSetSketchViewModel = jest.fn();

// Mock the individual functions inside the module
geometries.getPointGeometry.mockReturnValue('mockedPointGeometry');
geometries.getPolygonGeometry.mockReturnValue('mockedPolygonGeometry');

const mockSetGeometry = jest.fn();
const mockSetMeasurementUnit = jest.fn();

let currentMeasurementUnit = 'hectares';

describe('PolygonCoordinatesInput Component', () => {
  beforeEach(() => {
    render(
      <MuiThemeProvider>
        <PolygonCoordinatesInput
          mapView={mockMapView}
          sketchViewModel={mockSketchViewModel}
          setGeometry={mockSetGeometry}
          measurementUnit={currentMeasurementUnit}
          setMeasurementUnit={mockSetMeasurementUnit}
          setSketchViewModel={mockSetSketchViewModel}
        />
      </MuiThemeProvider>
    );
  });
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });
  test('opens PolygonCoordinatesInput modal', () => {
    // Check if the modal is initially closed
    expect(screen.queryByTestId('polygon-coordinates-modal')).not.toBeInTheDocument();

    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    // Check if the modal content is present after clicking the button
    expect(screen.queryByTestId('polygon-coordinates-modal')).toBeInTheDocument();
  });

  test('validates coordinates input', async () => {
    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    expect(screen.queryByText('Invalid latitude')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid longitude')).not.toBeInTheDocument();

    const latitudeInput = screen.getByTestId(`latitude-input-0`);
    const longitudeInput = screen.getByTestId(`longitude-input-0`);

    fireEvent.change(latitudeInput, { target: { value: '999999' } });
    fireEvent.change(longitudeInput, { target: { value: '99999' } });

    expect(screen.getByText('Invalid latitude')).toBeInTheDocument();
    expect(screen.getByText('Invalid longitude')).toBeInTheDocument();
  });

  test('allows adding new rows of coordinates input', () => {
    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    fireEvent.click(screen.getByText('Add Coordinate'));

    // Check if a new row of inputs has been added
    let latitudeInputs = screen.queryAllByTestId(/latitude-input-/);
    let longitudeInputs = screen.queryAllByTestId(/longitude-input-/);

    // Assuming that the initial state has one row,
    // the length should be 3 after adding one more
    // because user should not be able to add a line
    expect(latitudeInputs).toHaveLength(3);
    expect(longitudeInputs).toHaveLength(3);

    fireEvent.click(screen.getByText('Add Coordinate'));
    latitudeInputs = screen.queryAllByTestId(/latitude-input-/);
    longitudeInputs = screen.queryAllByTestId(/longitude-input-/);

    expect(latitudeInputs).toHaveLength(4);
    expect(longitudeInputs).toHaveLength(4);
  });

  test('allows removing a row of coordinates input', () => {
    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    // add two more rows
    fireEvent.click(screen.getByText('Add Coordinate'));
    fireEvent.click(screen.getByText('Add Coordinate'));

    let removeRowButtons = screen.queryAllByTestId(/coordinate-input-remove-row-/);

    // Assuming that the initial state has one row, so the length should be 4 after adding two more
    // (the fist time it adds two rows to prevent user from submiting a line)
    expect(removeRowButtons).toHaveLength(4);

    //delete one row
    fireEvent.click(removeRowButtons[0]);

    removeRowButtons = screen.queryAllByTestId(/latitude-input-/);
    expect(removeRowButtons).toHaveLength(3);
  });

  test('allows adding coordinates and submits a point geometry', async () => {
    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    const latitudeInput = screen.getByTestId(`latitude-input-0`);
    const longitudeInput = screen.getByTestId(`longitude-input-0`);

    fireEvent.change(latitudeInput, { target: { value: '40' } });
    fireEvent.change(longitudeInput, { target: { value: '-75' } });
    const mockGetPointGeometry = jest.spyOn(geometries, 'getPointGeometry');

    fireEvent.click(screen.getByText('OK'));

    await waitFor(() => {
      expect(mockGetPointGeometry).toHaveBeenCalled();

      expect(mockGetPointGeometry).toHaveBeenCalledWith(
        [
          {
            id: expect.any(String),
            latitude: 40,
            longitude: -75,
            errors: {
              latitude: false,
              longitude: false,
            },
          },
        ],
        NEW_LOCATION_AREA_OPTIONS.SMALL.id,
        'hectares',
        undefined
      );
    });
  });

  test('allows setting a custom radius and submits a point geometry', async () => {
    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    const latitudeInput = screen.getByTestId(`latitude-input-0`);
    const longitudeInput = screen.getByTestId(`longitude-input-0`);
    fireEvent.change(latitudeInput, { target: { value: '40' } });
    fireEvent.change(longitudeInput, { target: { value: '-75' } });

    // Select "Custom" as the radius option
    fireEvent.click(screen.queryByTestId('custom-area-radius-option'));

    // Enter a custom radius value
    const customRadiusInput = screen.queryByTestId('polygoon-coordinates-custom-area-input');
    fireEvent.change(customRadiusInput, { target: { value: '123' } });

    // Verify that the state variables are updated correctly
    expect(customRadiusInput.value).toBe('123');

    fireEvent.click(screen.queryByTestId('hectare-kilometer-switch'));
    expect(mockSetMeasurementUnit).toHaveBeenCalledWith('kilometers');

    const submitButton = screen.getByText('OK');
    fireEvent.click(submitButton);

    await waitFor(() => {
      // Check if the correct geometry is generated based on the custom radius
      const mockGetPointGeometry = jest.spyOn(geometries, 'getPointGeometry');

      expect(mockGetPointGeometry).toHaveBeenCalled();
      expect(mockGetPointGeometry).toHaveBeenCalledWith(
        [
          {
            id: expect.any(String),
            latitude: expect.any(Number),
            longitude: expect.any(Number),
            errors: {
              latitude: false,
              longitude: false,
            },
          },
        ],
        'custom-area', // Check if the selected radius is 'custom'
        'hectares', // Assuming the areaUnit is 'km' after switching
        '123' // Check if the customRadiusSize is '123'
      );
      expect(mockSetGeometry).toHaveBeenCalled();
    });
  });

  test('allows adding multiple coordinates and submits a polygon geometry', async () => {
    const button = screen.queryByTestId('polygon-coordinates-button');
    fireEvent.click(button);

    // Add two rows of coordinates
    fireEvent.click(screen.getByText('Add Coordinate'));

    // Enter values for each coordinate
    fireEvent.change(screen.getByTestId('latitude-input-0'), { target: { value: '40' } });
    fireEvent.change(screen.getByTestId('longitude-input-0'), { target: { value: '-75' } });

    fireEvent.change(screen.getByTestId('latitude-input-1'), { target: { value: '41' } });
    fireEvent.change(screen.getByTestId('longitude-input-1'), { target: { value: '-76' } });

    fireEvent.change(screen.getByTestId('latitude-input-2'), { target: { value: '42' } });
    fireEvent.change(screen.getByTestId('longitude-input-2'), { target: { value: '-77' } });

    const submitButton = screen.getByText('OK');
    fireEvent.click(submitButton);

    await waitFor(() => {
      const mockGetPolygonGeometry = jest.spyOn(geometries, 'getPolygonGeometry');

      // Check if the correct geometry is generated based on the multiple coordinates

      expect(mockGetPolygonGeometry).toHaveBeenCalled();
      expect(mockGetPolygonGeometry).toHaveBeenCalledWith([
        {
          id: expect.any(String),
          latitude: 40,
          longitude: -75,
          errors: { latitude: false, longitude: false },
        },
        {
          id: expect.any(String),
          latitude: 41,
          longitude: -76,
          errors: { latitude: false, longitude: false },
        },
        {
          id: expect.any(String),
          latitude: 42,
          longitude: -77,
          errors: { latitude: false, longitude: false },
        },
      ]);

      expect(mockSetGeometry).toHaveBeenCalled();
    });
  });
});
