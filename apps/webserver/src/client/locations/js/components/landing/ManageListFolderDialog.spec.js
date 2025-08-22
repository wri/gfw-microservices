import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageListFolderDialog from './ManageListFolderDialog';

// mock fetch util
jest.mock('../../../../common/js/utils/fetch', () => jest.fn());
import fetch from '../../../../common/js/utils/fetch';

// mock gtag
const mockFolders = [
  { id: 1, name: 'Folder A' },
  { id: 2, name: 'Folder B' },
];

const mockList = { id: 100, list_name: 'Test List', folder: null };

const baseProps = {
  isOpen: true,
  folders: [],
  list: mockList,
  onCancel: jest.fn(),
  onComplete: jest.fn(),
};

describe('ManageListFolderDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create new folder option when there are no folders', () => {
    render(<ManageListFolderDialog {...baseProps} />);
    expect(screen.getByLabelText(/create new/i)).toBeInTheDocument();
  });

  it('renders move option when folders exist', () => {
    render(<ManageListFolderDialog {...baseProps} folders={mockFolders} />);
    expect(screen.getByLabelText(/add to existing/i)).toBeInTheDocument();
  });

  it('disables confirm when no folder name entered for create', () => {
    render(<ManageListFolderDialog {...baseProps} />);
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    expect(confirmBtn).toBeDisabled();
  });

  it('enables confirm when folder name entered for create', () => {
    render(<ManageListFolderDialog {...baseProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New Folder' } });
    const confirmBtn = screen.getByRole('button', { name: /confirm/i });
    expect(confirmBtn).not.toBeDisabled();
  });

  it('calls _addToFolder and onComplete when creating a new folder succeeds', async () => {
    fetch.mockResolvedValueOnce([{ id: 10, name: 'New Folder' }]);
    fetch.mockResolvedValueOnce({}); // for _addList

    render(<ManageListFolderDialog {...baseProps} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New Folder' } });
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(baseProps.onComplete).toHaveBeenCalled();
    });
  });

  it('calls _addList when moving list to existing folder', async () => {
    fetch.mockResolvedValueOnce({}); // _addList return
    render(<ManageListFolderDialog {...baseProps} folders={mockFolders} />);
    fireEvent.click(screen.getByLabelText(/add to existing/i));
    fireEvent.change(screen.getByRole('combobox'), { target: { value: '0' } }); // Folder A
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/folder/1/add_lists' })
      );
    });
  });

  it('calls _removeFromFolder when removing from folder', async () => {
    const listInFolder = { ...mockList, folder: mockFolders[0] };
    fetch.mockResolvedValueOnce({});
    render(<ManageListFolderDialog {...baseProps} list={listInFolder} folders={mockFolders} />);
    fireEvent.click(screen.getByLabelText(/remove from folder/i));
    fireEvent.click(screen.getByRole('button', { name: /confirm/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.objectContaining({ url: '/folder/1/remove_lists' })
      );
    });
  });

  it('resets state when dialog is closed', () => {
    const { rerender } = render(<ManageListFolderDialog {...baseProps} isOpen={true} />);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Temp' } });

    rerender(<ManageListFolderDialog {...baseProps} isOpen={false} />);
    rerender(<ManageListFolderDialog {...baseProps} isOpen={true} />);
    expect(screen.getByRole('textbox')).toHaveValue('');
  });
});
