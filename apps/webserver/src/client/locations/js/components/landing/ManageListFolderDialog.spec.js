import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import ManageListFolderDialog from './ManageListFolderDialog';
import fetch from '../../../../common/js/utils/fetch';

const muiTheme = getMuiTheme();

const defaultProps = {
  list: { folder: null, list_name: 'Test List', id: 1 },
  folders: [],
  isOpen: true,
  onCancel: jest.fn(),
  onComplete: jest.fn(),
};

const renderWithTheme = (ui) =>
  render(<MuiThemeProvider muiTheme={muiTheme}>{ui}</MuiThemeProvider>);

const renderWithProps = (props = {}) =>
  renderWithTheme(<ManageListFolderDialog {...defaultProps} {...props} />);

jest.mock('../../../../common/js/utils/fetch', () => {
  return {
    __esModule: true,
    default: jest.fn(), // make the default export a jest mock
  };
});

// Mock locationsPage
jest.mock('../../../../common/js/config', () => ({
  locationsPage: {
    lists: {
      manageFolderDialog: {
        createNew: 'Create New Folder',
        addToExisting: 'Add to Existing Folder',
        foldersSelectPlaceholder: 'Select Folder',
        manageTitle: 'Manage Folder',
        addTitle: 'Add to Folder',
        confirm: 'Confirm',
        move1: '',
        move2: '',
        add1: '',
        add2: '',
        removed1: '',
        removed2: '',
        moved1: '',
        moved2: '',
        added1: '',
        added2: '',
        errorFolder: 'Error creating folder',
        errorList: 'Error adding list',
        errorRemove: 'Error removing list',
      },
    },
  },
}));

describe('ManageListFolderDialog', () => {
  beforeAll(() => {
    global.gtag = jest.fn();
  });

  beforeEach(() => jest.clearAllMocks());

  test('renders all options', async () => {
    renderWithProps({ isOpen: true });

    // wait for the dialog content
    await waitFor(() =>
      expect(screen.getByText('Create New Folder')).toBeInTheDocument()
    );
  });

  test('selects "Add to Existing Folder" and chooses a folder', async () => {
    const folders = [{ name: 'Folder A' }, { name: 'Folder B' }];
    const list = { folder: null, list_name: 'My List', id: 1 };

    renderWithProps({ open: true, folders, list });

    // Wait for the dialog to appear
    await waitFor(() =>
      expect(screen.getByText('Create New Folder')).toBeInTheDocument()
    );

    // Click the radio button for "Add to Existing Folder"
    const addExistingRadio = screen.getByLabelText('Add to Existing Folder');
    addExistingRadio.click();
    expect(addExistingRadio.checked).toBe(true);

    // Select a folder from the dropdown
    const select = screen.getByRole('combobox');
    select.value = '0'; // selects "Folder A"
    select.dispatchEvent(new Event('change', { bubbles: true }));
    expect(select.value).toBe('0');
  });

  test('clicking confirm calls onComplete when creating folder', async () => {
    // Mock fetch to return a new folder
    fetch.mockResolvedValue([{ id: 123, name: 'New Folder' }]);

    // Create a mock for onComplete
    const onComplete = jest.fn();

    // Render with this mock
    renderWithProps({ onComplete });

    // Type folder name
    fireEvent.change(screen.getByDisplayValue(''), { target: { value: 'New Folder' } });

    // Click confirm button
    fireEvent.click(screen.getByText('Confirm'));

    // Wait for onComplete to be called
    await waitFor(() => {
      expect(onComplete).toHaveBeenCalled();
      const callArg = onComplete.mock.calls[0][0];
      expect(callArg.props.children).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ props: { children: 'New Folder' } })
        ])
      );
    });
  });

  test('clicking confirm calls onComplete when moving list to existing folder', async () => {
    const folders = [{ name: 'Folder A', id: 1 }, { name: 'Folder B', id: 2 }];
    const list = { folder: null, list_name: 'My List', id: 10 };

    // Mock fetch to resolve to the folder
    fetch.mockResolvedValue({ ...folders[0] });

    renderWithProps({ folders, list });

    // Click "Add to Existing Folder"
    const addExistingRadio = screen.getByLabelText('Add to Existing Folder');
    fireEvent.click(addExistingRadio);

    // Select a folder from the dropdown
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '0' } }); // Folder A

    // Click confirm button
    fireEvent.click(screen.getByText('Confirm'));

    // Wait for onComplete to be called
    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalled();
      const callArg = defaultProps.onComplete.mock.calls[0][0];
      // Check that the folder name appears somewhere in the rendered fragment
      expect(callArg.props.children).toEqual(
        expect.arrayContaining([expect.objectContaining({ props: { children: 'Folder A' } })])
      );
    });
  });
});
