import { render, fireEvent, cleanup } from '@testing-library/react';
import CoordinateInputsContainer from './CoordinateInputsContainer';

afterEach(() => {
  cleanup();
});
describe('CoordinateInputsContainer', () => {
  it('should render without crashing', () => {
    const coordinates = [
      { id: '1', latitude: '', longitude: '', errors: {} },
      { id: '2', latitude: '', longitude: '', errors: {} },
    ];
    const onCoordinatesChange = jest.fn();
    const onDeleteCoordinate = jest.fn();
    const onAddCoordinate = jest.fn();
    const isPolygon = false;
    const switchInputType = jest.fn();

    render(
      <CoordinateInputsContainer
        coordinates={coordinates}
        onCoordinatesChange={onCoordinatesChange}
        onDeleteCoordinate={onDeleteCoordinate}
        onAddCoordinate={onAddCoordinate}
        isPolygon={isPolygon}
        switchInputType={switchInputType}
      />
    );
  });

  it('should switch input type when tab is clicked', () => {
    const coordinates = [
      { id: '1', latitude: '', longitude: '', errors: {} },
      { id: '2', latitude: '', longitude: '', errors: {} },
    ];
    const onCoordinatesChange = jest.fn();
    const onDeleteCoordinate = jest.fn();
    const onAddCoordinate = jest.fn();
    const isPolygon = false;
    const switchInputType = jest.fn();

    const { getByText } = render(
      <CoordinateInputsContainer
        coordinates={coordinates}
        onCoordinatesChange={onCoordinatesChange}
        onDeleteCoordinate={onDeleteCoordinate}
        onAddCoordinate={onAddCoordinate}
        isPolygon={isPolygon}
        switchInputType={switchInputType}
      />
    );

    fireEvent.click(getByText('polygon'));

    expect(switchInputType).toHaveBeenCalledWith(true);
  });
});
