import { render, screen, waitFor } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';
import { ConfigureList } from './ConfigureList';
import { UploadType, UserList } from '../types';
import { useUploadLocation } from '../contexts';
import { useFetch } from '../../../../../hooks';

jest.mock('../components', () => ({
  NavBar: () => <span />,
}));

jest.mock('../../../../../hooks', () => ({
  useFetch: jest.fn(),
}));

jest.mock('lodash/debounce', () => (_) => _);

const mockHistoryPush = jest.fn();
const mockHistoryGoBack = jest.fn();
jest.mock('../hooks', () => ({
  useHistory: () => ({ push: mockHistoryPush, goBack: mockHistoryGoBack }),
}));

jest.mock('@mui/material', () => ({
  ...jest.requireActual('@mui/material'),
  Dialog: () => <div data-testid="mock-dialog" />,
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
    commodity: 'Palm Oil',
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
    uploadType: UploadType.ByPolygon,
  },
  setUploadLocationByPoint: jest.fn(),
  setUploadLocationByPolygon: jest.fn(),
  addFile: jest.fn(),
  updateSaveMode: jest.fn(),
  selectUploadType: jest.fn(),
});

const mockUserLists: UserList[] = [
  {
    id: 5829,
    user_id: 10053,
    template_id: 10, //cattle
    list_name: 'Cattle 1',
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

const useFetchRequest = jest.fn();

describe('ConfigureList', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
    (useFetch as jest.Mock).mockReturnValue({
      data: [
        { id: 5829, name: 'Cattle 1' },
        { id: 5830, name: 'best list of cocoa 1' },
        { id: 5831, name: 'best list of cocoa 2' },
      ],
      isLoading: false,
      request: useFetchRequest,
      error: null,
    });
  });

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
    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(
      screen.getByRole('option', {
        name: /Sugar Cane/i,
      })
    );

    expect(screen.getByText(/sugar cane/i)).toBeInTheDocument();
  }, 10100);

  it('should show missing mandatory field errors', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    expect(screen.queryByText(/enter the commodity/i)).not.toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);
    expect(screen.queryByText(/enter the commodity/i)).toBeInTheDocument();

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    expect(screen.queryByText(/you must provide at least one list name/i)).not.toBeInTheDocument();
    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /soy/i }));
    await user.click(nextButton);
    expect(screen.queryByText(/enter the commodity/i)).not.toBeInTheDocument();
    expect(screen.queryAllByText(/you must provide at least one list name/i)).toHaveLength(2);

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /other/i }));
    const newListNameInput = screen.getByPlaceholderText(/name your new list/i);
    await user.type(newListNameInput, 'New list name');
    expect(screen.queryByText(/enter custom commodity/i)).not.toBeInTheDocument();
    await user.click(nextButton);
    expect(screen.queryByText(/enter custom commodity/i)).toBeInTheDocument();

    const customCommodityInput = screen.getByTestId('custom-commodity-input');
    await user.type(customCommodityInput, 'corn');

    await user.click(nextButton);
    expect(screen.queryByText(/enter custom commodity/i)).not.toBeInTheDocument();

    expect(mockHistoryPush).not.toHaveBeenCalledWith('SUMMARY_AND_SUBMIT');

    await user.click(
      screen.getByRole('checkbox', {
        name: /post-2020 risk assessment recommended to support eudr compliance deforestation in natural forest since 2021 \+ additional contextual datasets/i,
      })
    );

    await user.click(nextButton);
    expect(mockHistoryPush).toHaveBeenCalledWith('SUMMARY_AND_SUBMIT');
  }, 25100);

  it('should show validations for new list name field', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /cattle/i }));

    const newListNameInput = screen.getByPlaceholderText(/name your new list/i);
    await user.type(newListNameInput, 'cattle 1');

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    await waitFor(() => {
      expect(screen.queryByText(/this list name already exists/i)).toBeInTheDocument();
    });

    await user.clear(newListNameInput);
    await user.type(newListNameInput, 'invalid list name +');

    await waitFor(() => {
      expect(
        screen.queryByText(
          /Only letters \(including accented characters\), numbers, spaces, brackets \[\], parentheses \(\), dashes \(-\), and underscores \(_\) are allowed/i
        )
      ).toBeInTheDocument();
    });

    expect(mockHistoryPush).not.toHaveBeenCalledWith('SUMMARY_AND_SUBMIT');

    await user.clear(newListNameInput);
    await user.type(newListNameInput, 'valid list name');

    await user.click(
      screen.getByRole('checkbox', {
        name: /post-2000 forest change annual tree cover loss since 2001 \+ additional contextual and regional datasets/i,
      })
    );

    await user.click(nextButton);

    await waitFor(() => {
      expect(mockHistoryPush).toHaveBeenCalledWith('SUMMARY_AND_SUBMIT');
    });
  }, 20000);

  it('should show message when no existing lists are found for the chosen commodity', async () => {
    render(<ConfigureList userLists={[]} />);

    (useFetch as jest.Mock).mockReturnValueOnce({
      data: [],
      isLoading: false,
      request: jest.fn(),
      error: null,
    });

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /rubber/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/no matching list found for the chosen commodity/i)
      ).toBeInTheDocument();
    });

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /cattle/i }));

    await waitFor(() => {
      expect(
        screen.queryByText(/no matching list found for the chosen commodity/i)
      ).not.toBeInTheDocument();
    });
  }, 10000);

  it('should allow entering a new list name', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const newListNameInput = screen.getByPlaceholderText('Name your new list');
    await user.type(newListNameInput, 'New List');

    expect(newListNameInput).toHaveValue('New List');
  });

  it('should select an existing list and auto-populate analyses', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(
      screen.getByRole('option', {
        name: /Cocoa/i,
      })
    );

    expect(useFetchRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/api/list/by-commodity?commodity=cocoa',
      })
    );

    const existingListSelect = screen.getAllByRole('combobox')[1];

    await user.click(existingListSelect);
    await user.click(screen.getByRole('option', { name: /best list of cocoa 1/i }));

    expect(
      screen.getByRole('checkbox', {
        name: /post-2020 risk assessment recommended to support eudr compliance deforestation in natural forest since 2021 \+ additional contextual datasets/i,
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
  }, 10100);

  it('should select an existing list without analysis and no checkbox selected ', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(
      screen.getByRole('option', {
        name: /Cocoa/i,
      })
    );

    const existingListSelect = screen.getAllByRole('combobox')[1];

    await user.click(existingListSelect);
    await user.click(screen.getByRole('option', { name: /best list of cocoa 2/i }));

    expect(
      screen.getByRole('checkbox', {
        name: /post-2020 risk assessment recommended to support eudr compliance deforestation in natural forest since 2021 \+ additional contextual datasets/i,
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
  }, 10100);

  it('should toggle dependent checkboxes fcd and palm risk', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /palm oil/i }));

    const fcdCheckbox = screen.getByRole('checkbox', {
      name: /post-2000 forest change annual tree cover loss since 2001 \+ additional contextual and regional datasets/i,
    });
    const palmRiskCheckbox = screen.getByRole('checkbox', { name: /palm risk assessment/i });

    await user.click(palmRiskCheckbox);

    expect(palmRiskCheckbox).toBeChecked();
    expect(fcdCheckbox).toBeChecked();

    await user.click(fcdCheckbox);

    expect(fcdCheckbox).not.toBeChecked();
    expect(palmRiskCheckbox).not.toBeChecked();
  }, 15100);

  it('should go back to the previous page', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const backButton = screen.getByRole('button', {
      name: /back/i,
    });

    await user.click(backButton);
    expect(mockHistoryGoBack).toHaveBeenCalled();
  });

  it('should cancel upload', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const cancelButton = screen.getByRole('button', {
      name: /cancel/i,
    });

    await user.click(cancelButton);
    expect(mockClearUploadType).toHaveBeenCalled();
  });

  it('should submit the form with valid data', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /cattle/i }));

    const newListNameInput = screen.getByPlaceholderText('Name your new list');
    await user.type(newListNameInput, 'My new List 3');

    await user.click(
      screen.getByRole('checkbox', {
        name: /recent deforestation alerts recent deforestation alerts, updated weekly/i,
      })
    );

    const nextButton = screen.getByRole('button', { name: /next/i });
    await user.click(nextButton);

    expect(mockSetUploadLocationConfigureList).toHaveBeenCalledWith({
      commodity: 'Cattle',
      newListName: 'My new List 3',
      existingList: null,
      typeOfAnalysis: {
        PalmRisk: false,
        FCD: false,
        AFI: false,
        ALERTS: true,
      },
    });
    expect(mockHistoryPush).toHaveBeenCalledWith('SUMMARY_AND_SUBMIT');
  }, 10100);

  it('should call api adding gfwp_ in the beginning for custom commodities', async () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const commodityDropdown = screen.getAllByRole('combobox')[0];

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /cattle/i }));
    expect(useFetchRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/api/list/by-commodity?commodity=gfwp_cattle',
      })
    );

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /pulp and paper/i }));
    expect(useFetchRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/api/list/by-commodity?commodity=gfwp_pulp and paper',
      })
    );

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /multiple/i }));
    expect(useFetchRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/api/list/by-commodity?commodity=gfwp_multiple',
      })
    );

    await user.click(commodityDropdown);
    await user.click(screen.getByRole('option', { name: /other/i }));
    const customCommodityInput = screen.getByTestId('custom-commodity-input');
    await user.type(customCommodityInput, 'corn');

    expect(useFetchRequest).toHaveBeenLastCalledWith(
      expect.objectContaining({
        url: '/api/list/by-commodity?commodity=gfwp_corn',
      })
    );
  }, 15100);

  it('should only show the three available types of analysis', () => {
    render(<ConfigureList userLists={mockUserLists} />);

    const amountOfTypesOfAnalysis = screen.getAllByRole('checkbox');

    expect(amountOfTypesOfAnalysis.length).toBe(3);
  });
});
