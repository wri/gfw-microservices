import { cleanup, render, screen, within } from '@testing-library/react';
import { UploadLocationOptions } from '.';
import { useUploadLocation } from '../contexts';
import { UploadType } from '../types';
import userEvent from '@testing-library/user-event';

const mockHistoryPush = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({ push: mockHistoryPush }),
}));

jest.mock('../contexts');
const mockSelectUploadType = jest.fn();
jest.mocked(useUploadLocation).mockReturnValue({
  selectUploadType: mockSelectUploadType,
  uploadLocationState: {
    newListName: 'Random list name 123',
    existingList: null,
    commodity: 'palm-oil',
    typeOfAnalysis: {
      AFI: true,
      ALERTS: true,
      FCD: true,
      PalmRisk: true,
    },
    area: { measurementUnit: 'hectares', size: 0 },
    coordinates: [{ latitude: 1.1, longitude: 1.1 }],
    locationName: 'location name',
    uploadedFile: { fileS3Route: '', keyFile: '', url: '' },
    uploadType: UploadType.ByPoint,
  },
  clearUploadType: jest.fn(),
  setUploadLocationByPoint: jest.fn(),
  setUploadLocationByPolygon: jest.fn(),
  setUploadLocationConfigureList: jest.fn(),
  addFile: jest.fn(),
  updateSaveMode: jest.fn(),
});

afterEach(cleanup);

describe('UploadLocationOptions', () => {
  it('should render correctly', () => {
    render(<UploadLocationOptions />);

    expect(
      screen.getByText(/gfw pro allows users to upload their data in multiple ways\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/how to format your location data for gfw pro/i)).toBeInTheDocument();
    expect(
      screen.getByText(/best for multiple location or if your data is contained within a file\./i)
    ).toBeInTheDocument();
    expect(screen.getByText(/how to format your location data for gfw pro/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /if you would like to enter a single location without uploading a file, you can define your location via one of our interactive workflows:/i
      )
    ).toBeInTheDocument();
  });

  it.each([
    ['file upload', UploadType.ByFile, 'UPLOAD_BY_FILE'],
    ['point', UploadType.ByPoint, 'UPLOAD_BY_POINT'],
    ['polygon', UploadType.ByPolygon, 'UPLOAD_BY_POLYGON'],
  ])(
    'should trigger the correct actions when clicking %s button',
    async (buttonName, expectedUploadType, expectedRoute) => {
      render(<UploadLocationOptions />);

      const button = screen.getByRole('button', {
        name: new RegExp(buttonName, 'i'),
      });

      expect(mockHistoryPush).not.toHaveBeenCalled();
      expect(mockSelectUploadType).not.toHaveBeenCalled();
      await userEvent.click(button);
      expect(mockSelectUploadType).toHaveBeenCalledWith(expectedUploadType);
      expect(mockHistoryPush).toHaveBeenCalledWith(expectedRoute);
    }
  );

  it('should trigger the correction action for the back button to locations', async () => {
    render(<UploadLocationOptions />);

    expect(
      screen.getByRole('heading', {
        name: /locations/i,
      })
    ).toBeInTheDocument();

    const navigation = screen.getByRole('navigation');
    const button = within(navigation).getByRole('link');

    expect(mockHistoryPush).not.toHaveBeenCalled();
    await userEvent.click(button);
    expect(mockHistoryPush).toHaveBeenCalledWith('LOCATIONS');
  });

  it('should trigger the correction action for the back button to list details', async () => {
    render(
      <UploadLocationOptions
        fromList={123}
        userLists={[
          {
            id: 111,
            list_name: 'list1',
            list_status_id: 1,
            listAnalysesStatus: [{ analysisId: 'ALERTS', listId: 1 }],
            location_classification: '',
            template_id: 1,
            user_id: 1,
          },
          {
            id: 123,
            list_name: 'custom list',
            list_status_id: 1,
            listAnalysesStatus: [{ analysisId: 'ALERTS', listId: 123 }],
            location_classification: '',
            template_id: 1,
            user_id: 1,
          },
        ]}
      />
    );

    expect(
      screen.getByRole('heading', {
        name: /custom list/i,
      })
    ).toBeInTheDocument();

    const navigation = screen.getByRole('navigation');
    const button = within(navigation).getByRole('link');

    expect(button).toHaveAttribute('href', '/list-details?id=123');
  });
});
