import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigureList } from './ConfigureList';
import { UploadType, UserList } from '../types';
import { useUploadLocation } from '../contexts';

jest.mock('../components', () => ({
  NavBar: () => <span />,
}));

const mockHistoryPush = jest.fn();
const mockHistoryGoBack = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({ push: mockHistoryPush, goBack: mockHistoryGoBack }),
}));

jest.mock('../contexts');
const mockSetUploadLocationConfigureList = jest.fn();
const mockClearUploadType = jest.fn();
jest.mocked(useUploadLocation).mockReturnValue({
  setUploadLocationConfigureList: mockSetUploadLocationConfigureList,
  clearUploadType: mockClearUploadType,
  uploadLocationState: {
    newListName: 'Random list name 123',
    existingList: null,
    commodity: 'palm-oil',
    typeOfAnalysis: {
      AFI: true,
      ALERTS: true,
      FCD: true,
      palmRiskAssessment: true,
    },
    area: { measurementUnit: 'hectares', size: 0 },
    coordinates: [{ latitude: 1.1, longitude: 1.1 }],
    locationName: 'location name',
    uploadedFile: { fileS3Route: '', keyFile: '', url: '' },
    uploadType: UploadType.ByPolygon,
  },
  setUploadLocationByPoint: jest.fn(),
  setUploadLocationByPolygon: jest.fn(),
  addFile: jest.fn(),
  updateSaveMode: jest.fn(),
});

const mockUserLists: UserList[] = [
  {
    id: 5829,
    user_id: 10053,
    template_id: 10, //cattle
    list_name: 'cattle 1',
    list_status_id: 2,
    location_classification: '',
    listAnalysesStatus: [
      {
        listId: 5829,
        analysisId: 'FCD',
      },
    ],
  },
  {
    id: 5830,
    user_id: 10053,
    template_id: 12, //cocoa
    list_name: 'best list of cocoa 1',
    list_status_id: 2,
    location_classification: '',
    listAnalysesStatus: [
      {
        listId: 5830,
        analysisId: 'FCD',
      },
      {
        listId: 5830,
        analysisId: 'ALERTS',
      },
      {
        listId: 5830,
        analysisId: 'AFI',
      },
    ],
  },
  {
    id: 5831,
    user_id: 10053,
    template_id: 12, //cocoa
    list_name: 'best list of cocoa 2',
    list_status_id: 2,
    location_classification: '',
    listAnalysesStatus: [],
  },
];

afterEach(() => {
  cleanup();
});

describe('ConfigureList', () => {
  it('should render the form fields correctly', () => {
    render(<ConfigureList userLists={mockUserLists} />);

    expect(screen.getByText('Configure List')).toBeInTheDocument();
    expect(screen.getByText('Commodity')).toBeInTheDocument();
    expect(screen.getByText('Define List')).toBeInTheDocument();
    expect(screen.getByText('Type of analysis')).toBeInTheDocument();
  });

  it('should allow selecting a commodity', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    expect(
      screen.queryByRole('option', {
        name: /sugar cane/i,
      })
    ).not.toBeInTheDocument();
    const commoditySelect = screen.getAllByRole('combobox')[0];

    await userEvent.click(commoditySelect);
    await userEvent.click(
      screen.getByRole('option', {
        name: /sugar cane/i,
      })
    );

    expect(screen.getByText(/sugar cane/i)).toBeInTheDocument();
  });

  it('should validate list name fields correctly', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    expect(screen.queryAllByText(/you must provide at least one list name./i)).toHaveLength(2);
  });

  it('should allow entering a new list name', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const newListInput = screen.getByPlaceholderText('Name your new list');
    await userEvent.type(newListInput, 'New List');

    expect(newListInput).toHaveValue('New List');
  });

  it('should select an existing list and auto-populate analyses', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commoditySelect = screen.getAllByRole('combobox')[0];

    await userEvent.click(commoditySelect);
    await userEvent.click(
      screen.getByRole('option', {
        name: /cocoa/i,
      })
    );

    const existingListSelect = screen.getAllByRole('combobox')[1];

    await userEvent.click(existingListSelect);
    await userEvent.click(screen.getByRole('option', { name: /best list of cocoa 1/i }));

    expect(
      screen.getByRole('checkbox', {
        name: /post-2020 risk assessment deforestation in natural forest since 2021 \+ additional contextual datasets/i,
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: /post-2000 forest change annual tree cover loss since 2001 \+ additional contextual and regional datasets/i,
      })
    ).toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: /recent deforestation alerts recent deforestation alerts, updated weekly/i,
      })
    ).toBeChecked();
  });

  it('should select an existing list without analysis and no checkbox selected ', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commoditySelect = screen.getAllByRole('combobox')[0];

    await userEvent.click(commoditySelect);
    await userEvent.click(
      screen.getByRole('option', {
        name: /cocoa/i,
      })
    );

    const existingListSelect = screen.getAllByRole('combobox')[1];

    await userEvent.click(existingListSelect);
    await userEvent.click(screen.getByRole('option', { name: /best list of cocoa 2/i }));

    expect(
      screen.getByRole('checkbox', {
        name: /post-2020 risk assessment deforestation in natural forest since 2021 \+ additional contextual datasets/i,
      })
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: /post-2000 forest change annual tree cover loss since 2001 \+ additional contextual and regional datasets/i,
      })
    ).not.toBeChecked();
    expect(
      screen.getByRole('checkbox', {
        name: /recent deforestation alerts recent deforestation alerts, updated weekly/i,
      })
    ).not.toBeChecked();
  });

  it('should toggle dependent checkboxes fcd and palm risk', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commoditySelect = screen.getAllByRole('combobox')[0];

    await userEvent.click(commoditySelect);
    await userEvent.click(screen.getByRole('option', { name: /palm oil/i }));

    const fcdCheckbox = screen.getByRole('checkbox', {
      name: /post-2000 forest change annual tree cover loss since 2001 \+ additional contextual and regional datasets/i,
    });
    const palmRiskCheckbox = screen.getByRole('checkbox', { name: /palm risk assessment/i });

    await userEvent.click(palmRiskCheckbox);

    expect(palmRiskCheckbox).toBeChecked();
    expect(fcdCheckbox).toBeChecked();

    await userEvent.click(fcdCheckbox);

    expect(fcdCheckbox).not.toBeChecked();
    expect(palmRiskCheckbox).not.toBeChecked();
  }, 10100);

  it('should go back to the previous page', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const backButton = screen.getByRole('button', {
      name: /back/i,
    });

    await userEvent.click(backButton);
    expect(mockHistoryGoBack).toHaveBeenCalled();
  });

  it('should cancel upload', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const cancelButton = screen.getByRole('button', {
      name: /cancel/i,
    });

    await userEvent.click(cancelButton);
    expect(mockClearUploadType).toHaveBeenCalled();
  });

  it('should submit the form with valid data', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commoditySelect = screen.getAllByRole('combobox')[0];

    await userEvent.click(commoditySelect);
    await userEvent.click(screen.getByRole('option', { name: /cattle/i }));

    const newListInput = screen.getByPlaceholderText('Name your new list');
    await userEvent.type(newListInput, 'My new List 3');

    await userEvent.click(
      screen.getByRole('checkbox', {
        name: /recent deforestation alerts recent deforestation alerts, updated weekly/i,
      })
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await userEvent.click(nextButton);

    expect(mockSetUploadLocationConfigureList).toHaveBeenCalledWith({
      commodity: 'cattle',
      newListName: 'My new List 3',
      existingList: null,
      typeOfAnalysis: {
        palmRiskAssessment: false,
        FCD: false,
        AFI: false,
        ALERTS: true,
      },
    });
    expect(mockHistoryPush).toHaveBeenCalledWith('SUMMARY_AND_SUBMIT');
  });
});
