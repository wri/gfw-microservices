import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { SummaryAndSubmit } from './SummaryAndSubmit';
import { useUploadLocation } from '../contexts';
import { UploadType } from '../types';

jest.mock('../contexts');
const mockClearUploadType = jest.fn();
jest.mocked(useUploadLocation).mockReturnValue({
  clearUploadType: mockClearUploadType,
  uploadLocationState: {
    newListName: 'Random list name 123',
    existingList: null,
    commodity: 'palm-oil',
    typeOfAnalysis: {
      AFI: true,
      ALERTS: true,
      FCD: true,
      PalmRisk: true,
      Weekly: false,
    },
    area: { measurementUnit: 'hectares', size: 0 },
    coordinates: [{ latitude: 1.1, longitude: 1.1 }],
    locationName: 'location name',
    uploadedFile: { fileS3Route: '', keyFile: '', url: '' },
    uploadType: UploadType.ByPoint,
  },
  setUploadLocationByPoint: jest.fn(),
  setUploadLocationByPolygon: jest.fn(),
  setUploadLocationConfigureList: jest.fn(),
  addFile: jest.fn(),
  updateSaveMode: jest.fn(),
  selectUploadType: jest.fn(),
});

jest.mock('../../../../../hooks', () => ({
  useTransifexTranslation: jest.fn((key) => key),
}));

jest.mock('../components', () => ({
  FileValidationHelper: () => <span data-testid="file-validation-helper" />,
  NavBar: () => <span />,
}));

jest.mock('axios');
const mockAxios = jest.mocked(axios);

jest.mock('../utils/upload', () => ({
  uploadFileToS3: jest.fn(),
}));

const mockGtag = jest.fn();
global.gtag = mockGtag;

const mockGoBack = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({
    goBack: mockGoBack,
  }),
}));

const mockUploadFileToS3 = jest.fn().mockResolvedValue({
  fileS3Route: 's3://bucket/file.geojson',
  keyFile: 'file.geojson',
  url: 'https://s3.amazonaws.com/bucket/file.geojson',
});

const mockUploadProcessByPrevUploadedFile = jest.fn().mockResolvedValue({});

jest.mock('../utils/upload', () => ({
  uploadFileToS3: () => mockUploadFileToS3(),
}));

jest.mock('../../landing/uploadProcess', () => ({
  uploadProcessByPrevUploadedFile: (args: any) => mockUploadProcessByPrevUploadedFile(args),
}));

beforeEach(() => {
  jest.clearAllMocks();
  mockAxios.post.mockResolvedValue({ data: { success: true } });
});

describe('SummaryAndSubmit', () => {
  it('should render correct information when creating a new list with all analysis types selected', () => {
    render(<SummaryAndSubmit />);

    expect(screen.getByText(/you are/i)).toBeInTheDocument();
    expect(screen.getByText(/creating a new/i)).toBeInTheDocument();
    expect(screen.getByText(/list named/i)).toBeInTheDocument();

    expect(screen.getByText(/palm oil/i)).toBeInTheDocument();
    expect(screen.getByText(/random list name 123/i)).toBeInTheDocument();
    expect(
      screen.getByText(/your list will be submitted for the following analysis:/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/post-2020 risk assessment/i)).toBeInTheDocument();
    expect(screen.getByText(/recent disturbance alerts/i)).toBeInTheDocument();
    expect(screen.getByText(/post-2000 forest change/i)).toBeInTheDocument();
    expect(screen.getByText(/\(includes palm risk assessment\)/i)).toBeInTheDocument();
    expect(
      screen.getByText(
        /please note that all analysis submissions count towards your usage limits\. see more information \./i
      )
    ).toBeInTheDocument();
    expect(screen.getByTestId('file-validation-helper')).toBeInTheDocument();
  });

  it('should render correctly for existing list and only Alerts analysis selected', () => {
    jest.mocked(useUploadLocation).mockReturnValueOnce({
      clearUploadType: mockClearUploadType,
      uploadLocationState: {
        newListName: '',
        existingList: { name: 'List created last year', id: 1, analysisIds: [] },
        commodity: 'sugar-cane',
        typeOfAnalysis: {
          AFI: false,
          ALERTS: true,
          FCD: false,
          PalmRisk: false,
          Weekly: false,
        },
        area: { measurementUnit: 'hectares', size: 0 },
        coordinates: [{ latitude: 1.1, longitude: 1.1 }],
        locationName: 'location name',
        uploadedFile: { fileS3Route: '', keyFile: '', url: '' },
        uploadType: UploadType.ByFile,
      },
      setUploadLocationByPoint: jest.fn(),
      setUploadLocationByPolygon: jest.fn(),
      setUploadLocationConfigureList: jest.fn(),
      addFile: jest.fn(),
      updateSaveMode: jest.fn(),
      selectUploadType: jest.fn(),
    });

    render(<SummaryAndSubmit />);

    expect(screen.getByText(/you are/i)).toBeInTheDocument();

    expect(screen.getByText(/adding/i)).toBeInTheDocument();

    expect(screen.getByText(/location\(s\) to the list named/i)).toBeInTheDocument();

    expect(screen.getByText(/sugar cane/i)).toBeInTheDocument();
    expect(screen.getByText(/list created last year/i)).toBeInTheDocument();
    expect(
      screen.getByText(/the resulting list will be submitted for the following analysis:/i)
    ).toBeInTheDocument();
    expect(screen.queryByText(/post-2020 risk assessment/i)).not.toBeInTheDocument();
    expect(screen.getByText(/recent disturbance alerts/i)).toBeInTheDocument();
    expect(screen.queryByText(/post-2000 forest change/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\(includes palm risk assessment\)/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(
        /please note that all analysis submissions count towards your usage limits\. see more information \./i
      )
    ).toBeInTheDocument();
  });

  it('should call history.goBack when back button is clicked', async () => {
    const user = userEvent.setup();
    render(<SummaryAndSubmit />);

    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(mockGoBack).toHaveBeenCalled();
  });

  it('should call clearUploadType when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<SummaryAndSubmit />);

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockClearUploadType).toHaveBeenCalled();
  });

  it('should call /vectorTile/deleteTiles when updating an existing list', async () => {
    const user = userEvent.setup();

    jest.mocked(useUploadLocation).mockReturnValue({
      clearUploadType: mockClearUploadType,
      uploadLocationState: {
        newListName: '',
        existingList: { name: 'Existing List', id: 123, analysisIds: [] },
        commodity: 'palm-oil',
        typeOfAnalysis: {
          AFI: true,
          ALERTS: false,
          FCD: false,
          PalmRisk: false,
          Weekly: false,
        },
        area: { measurementUnit: 'hectares', size: 0 },
        coordinates: [{ latitude: 1.1, longitude: 1.1 }],
        locationName: 'location name',
        uploadedFile: {
          fileS3Route: 'existing-route',
          keyFile: 'existing-key',
          url: '',
        },
        uploadType: UploadType.ByPoint,
      },
      setUploadLocationByPoint: jest.fn(),
      setUploadLocationByPolygon: jest.fn(),
      setUploadLocationConfigureList: jest.fn(),
      addFile: jest.fn(),
      updateSaveMode: jest.fn(),
      selectUploadType: jest.fn(),
    });

    render(<SummaryAndSubmit />);

    const submitButton = screen.getByRole('button', { name: /submit for analysis/i });
    expect(submitButton).toBeInTheDocument();
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[0]);

    await waitFor(() => {
      expect(mockAxios.post).toHaveBeenCalledWith('/vectorTile/deleteTiles', {
        listID: 123,
      });
    });
  });

  it('should pass options="Weekly" when Weekly Alerts and ALERTS are both selected', async () => {
    const user = userEvent.setup();

    // Mock feature flag
    const originalFeatureFlags = (global as any).featureFlags;
    (global as any).featureFlags = { isWeeklyAlertsAvailable: true };

    jest.mocked(useUploadLocation).mockReturnValue({
      clearUploadType: mockClearUploadType,
      uploadLocationState: {
        newListName: 'Test List with Weekly',
        existingList: null,
        commodity: 'palm-oil',
        typeOfAnalysis: {
          AFI: false,
          ALERTS: true,
          FCD: false,
          PalmRisk: false,
          Weekly: true, // Weekly is selected
        },
        area: { measurementUnit: 'hectares', size: 0 },
        coordinates: [{ latitude: 1.1, longitude: 1.1 }],
        locationName: 'location name',
        uploadedFile: {
          fileS3Route: 's3://bucket/file',
          keyFile: 'file.csv',
          url: 'https://example.com',
        },
        uploadType: UploadType.ByFile,
      },
      setUploadLocationByPoint: jest.fn(),
      setUploadLocationByPolygon: jest.fn(),
      setUploadLocationConfigureList: jest.fn(),
      addFile: jest.fn(),
      updateSaveMode: jest.fn(),
      selectUploadType: jest.fn(),
    });

    render(<SummaryAndSubmit />);

    const submitButton = screen.getByRole('button', { name: /submit for analysis/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[0]);

    await waitFor(() => {
      expect(mockUploadProcessByPrevUploadedFile).toHaveBeenCalledWith(
        expect.objectContaining({
          options: 'Weekly',
        })
      );
    });

    // Restore feature flags
    (global as any).featureFlags = originalFeatureFlags;
  });

  it('should pass options=null when Weekly Alerts is not selected', async () => {
    const user = userEvent.setup();

    jest.mocked(useUploadLocation).mockReturnValue({
      clearUploadType: mockClearUploadType,
      uploadLocationState: {
        newListName: 'Test List without Weekly',
        existingList: null,
        commodity: 'palm-oil',
        typeOfAnalysis: {
          AFI: false,
          ALERTS: true,
          FCD: false,
          PalmRisk: false,
          Weekly: false, // Weekly is NOT selected
        },
        area: { measurementUnit: 'hectares', size: 0 },
        coordinates: [{ latitude: 1.1, longitude: 1.1 }],
        locationName: 'location name',
        uploadedFile: {
          fileS3Route: 's3://bucket/file',
          keyFile: 'file.csv',
          url: 'https://example.com',
        },
        uploadType: UploadType.ByFile,
      },
      setUploadLocationByPoint: jest.fn(),
      setUploadLocationByPolygon: jest.fn(),
      setUploadLocationConfigureList: jest.fn(),
      addFile: jest.fn(),
      updateSaveMode: jest.fn(),
      selectUploadType: jest.fn(),
    });

    render(<SummaryAndSubmit />);

    const submitButton = screen.getByRole('button', { name: /submit for analysis/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[0]);

    await waitFor(() => {
      expect(mockUploadProcessByPrevUploadedFile).toHaveBeenCalledWith(
        expect.objectContaining({
          options: null,
        })
      );
    });
  });

  it('should pass options=null when Weekly is selected but ALERTS is not selected', async () => {
    const user = userEvent.setup();

    // Mock feature flag
    const originalFeatureFlags = (global as any).featureFlags;
    (global as any).featureFlags = { isWeeklyAlertsAvailable: true };

    jest.mocked(useUploadLocation).mockReturnValue({
      clearUploadType: mockClearUploadType,
      uploadLocationState: {
        newListName: 'Test List with Weekly but no ALERTS',
        existingList: null,
        commodity: 'palm-oil',
        typeOfAnalysis: {
          AFI: true,
          ALERTS: false, // ALERTS is NOT selected
          FCD: true,
          PalmRisk: false,
          Weekly: true, // Weekly is selected (but shouldn't be applied)
        },
        area: { measurementUnit: 'hectares', size: 0 },
        coordinates: [{ latitude: 1.1, longitude: 1.1 }],
        locationName: 'location name',
        uploadedFile: {
          fileS3Route: 's3://bucket/file',
          keyFile: 'file.csv',
          url: 'https://example.com',
        },
        uploadType: UploadType.ByFile,
      },
      setUploadLocationByPoint: jest.fn(),
      setUploadLocationByPolygon: jest.fn(),
      setUploadLocationConfigureList: jest.fn(),
      addFile: jest.fn(),
      updateSaveMode: jest.fn(),
      selectUploadType: jest.fn(),
    });

    render(<SummaryAndSubmit />);

    const submitButton = screen.getByRole('button', { name: /submit for analysis/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    });

    const okButtons = screen.getAllByRole('button', { name: /ok/i });
    await user.click(okButtons[0]);

    await waitFor(() => {
      expect(mockUploadProcessByPrevUploadedFile).toHaveBeenCalledWith(
        expect.objectContaining({
          options: null, // Should be null because ALERTS is not selected
        })
      );
    });

    // Restore feature flags
    (global as any).featureFlags = originalFeatureFlags;
  });
});
