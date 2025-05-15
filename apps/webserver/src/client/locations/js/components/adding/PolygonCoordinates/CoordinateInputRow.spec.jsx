import { render, fireEvent, cleanup } from '@testing-library/react';
import CoordinateInputRow from './CoordinateInputRow';

afterEach(() => {
  cleanup();
});
describe('CoordinateInputRow', () => {
  it('should render without crashing', () => {
    const id = '1';
    const index = 0;
    const latitude = '';
    const longitude = '';
    const errors = { latitude: false, longitude: false };
    const onCoordinatesChange = jest.fn();
    const onDeleteCoordinate = jest.fn();
    const showDeleteIcon = true;

    render(
      <CoordinateInputRow
        id={id}
        index={index}
        latitude={latitude}
        longitude={longitude}
        errors={errors}
        onCoordinatesChange={onCoordinatesChange}
        onDeleteCoordinate={onDeleteCoordinate}
        showDeleteIcon={showDeleteIcon}
      />
    );
  });

  it('should call onDeleteCoordinate when delete icon is clicked', () => {
    const id = '1';
    const index = 0;
    const latitude = '';
    const longitude = '';
    const errors = { latitude: false, longitude: false };
    const onCoordinatesChange = jest.fn();
    const onDeleteCoordinate = jest.fn();
    const showDeleteIcon = true;

    const { getByTestId } = render(
      <CoordinateInputRow
        id={id}
        index={index}
        latitude={latitude}
        longitude={longitude}
        errors={errors}
        onCoordinatesChange={onCoordinatesChange}
        onDeleteCoordinate={onDeleteCoordinate}
        showDeleteIcon={showDeleteIcon}
      />
    );

    const deleteIcon = getByTestId(`coordinate-input-remove-row-${index}`);
    fireEvent.click(deleteIcon);

    expect(onDeleteCoordinate).toHaveBeenCalledWith(id);
  });

  it('should call onCoordinatesChange when latitude input changes', () => {
    const id = '1';
    const index = 0;
    const latitude = '';
    const longitude = '';
    const errors = { latitude: false, longitude: false };
    const onCoordinatesChange = jest.fn();
    const onDeleteCoordinate = jest.fn();
    const showDeleteIcon = true;

    const { getByTestId } = render(
      <CoordinateInputRow
        id={id}
        index={index}
        latitude={latitude}
        longitude={longitude}
        errors={errors}
        onCoordinatesChange={onCoordinatesChange}
        onDeleteCoordinate={onDeleteCoordinate}
        showDeleteIcon={showDeleteIcon}
      />
    );
    console.log({ index });
    const latitudeInput = getByTestId(`latitude-input-${index}`);
    fireEvent.change(latitudeInput, { target: { value: '50' } });

    expect(onCoordinatesChange).toHaveBeenCalledWith(expect.any(Object), id, 'latitude');
  });

  it('should call onCoordinatesChange when longitude input changes', () => {
    const id = '1';
    const index = 0;
    const latitude = '';
    const longitude = '';
    const errors = { latitude: false, longitude: false };
    const onCoordinatesChange = jest.fn();
    const onDeleteCoordinate = jest.fn();
    const showDeleteIcon = true;

    const { getByTestId } = render(
      <CoordinateInputRow
        id={id}
        index={index}
        latitude={latitude}
        longitude={longitude}
        errors={errors}
        onCoordinatesChange={onCoordinatesChange}
        onDeleteCoordinate={onDeleteCoordinate}
        showDeleteIcon={showDeleteIcon}
      />
    );

    const longitudeInput = getByTestId(`longitude-input-${index}`);
    fireEvent.change(longitudeInput, { target: { value: '50' } });

    expect(onCoordinatesChange).toHaveBeenCalledWith(expect.any(Object), id, 'longitude');
  });
});
