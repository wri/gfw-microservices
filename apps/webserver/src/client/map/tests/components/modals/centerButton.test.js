import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapRecenterButton from '../../../js/components/modals/MapRecenterButton';
import { getListMbtileInfo } from '../../../../common/js/userListLocations/services/userListMbtileInfo.service';
import { goToUserListLocations } from '../../../../common/js/userListLocations/utils/userListLocationsMap.util';
import { DEFAULT_MAPVIEW_CENTER } from '../../../js/config/map.config';

jest.mock('../../../../common/js/userListLocations/services/userListMbtileInfo.service');
jest.mock('../../../../common/js/userListLocations/utils/userListLocationsMap.util');

describe('MapRecenterButton', () => {
  const mapViewMock = {
    goTo: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('should render button when selectedList has items', () => {
    render(<MapRecenterButton selectedList={[{ id: 1 }]} mapView={mapViewMock} />);

    expect(screen.queryByTestId('map-center-button')).toBeInTheDocument();
  });

  test('should not render button when selectedList is empty', () => {
    render(<MapRecenterButton selectedList={[]} mapView={mapViewMock} />);

    expect(screen.queryByTestId('map-center-button')).not.toBeInTheDocument();
  });

  test('should call getListMbtileInfo and set mapInfo when button is clicked', async () => {
    const bounds = [
      [1, 2],
      [3, 4],
    ];
    getListMbtileInfo.mockResolvedValueOnce({ bounds });

    render(<MapRecenterButton selectedList={[{ id: 1 }]} mapView={mapViewMock} />);

    const button = await screen.getByTestId('map-center-button');
    fireEvent.click(button);

    expect(getListMbtileInfo).toHaveBeenCalledWith(1);
    expect(goToUserListLocations).toHaveBeenCalledWith(mapViewMock, bounds);
  });

  test('should center map to default location if no mapInfo', async () => {
    getListMbtileInfo.mockResolvedValueOnce({ bounds: [] });

    render(<MapRecenterButton selectedList={[{ id: 1 }]} mapView={mapViewMock} />);

    const button = await screen.getByTestId('map-center-button');
    fireEvent.click(button);

    expect(mapViewMock.goTo).toHaveBeenCalledWith({
      center: DEFAULT_MAPVIEW_CENTER,
      zoom: 3,
    });
  });
});
