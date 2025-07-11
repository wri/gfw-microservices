import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CopyMoveModal from './CopyMoveModal';
import axios from 'axios';

jest.mock('axios');

const defaultProps = {
  isGfwList: false,
  selectedMoveOrCopy: 'copy',
  selectedNewOrExisting: 'existing',
  newListName: '',
  isNewListNameDuplicate: false,
  isNewListNameValid: true,
  selectedLists: [{ list_name: 'Test List' }],
  locationsCount: 5,
  setMoveOrCopy: jest.fn(),
  setNewOrExisting: jest.fn(),
  updateNewListName: jest.fn(),
  updateSelectedMove: jest.fn(),
};

beforeAll(() => {
  axios.get.mockResolvedValue({
    data: [
      { id: 5830, name: 'List A' },
      { id: 5831, name: 'List B' },
    ],
  });
});

describe('CopyMoveModal', () => {
  test('renders the modal with copy option selected', () => {
    render(<CopyMoveModal {...defaultProps} />);

    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText(/5 selected location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Copy/i)).toBeChecked();
  });

  test('allows changing from copy to move', async () => {
    await act(async () => {
      render(<CopyMoveModal {...defaultProps} selectedMoveOrCopy="move" />);
    });

    expect(screen.getByText(/remove/i)).toBeInTheDocument();
    expect(screen.getByText(/5 selected locations/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/move/i)).toBeChecked();
  });

  test('renders the existing list dropdown', async () => {
    await act(async () => {
      render(<CopyMoveModal {...defaultProps} />);
    });

    expect(screen.getByText('List A')).toBeInTheDocument();
    expect(screen.getByText('List B')).toBeInTheDocument();
  });

  test('calls setMoveOrCopy when selecting move', async () => {
    await act(async () => {
      render(<CopyMoveModal {...defaultProps} />);
    });

    const moveRadio = screen.getByLabelText(/move/i);
    await userEvent.click(moveRadio);
    expect(defaultProps.setMoveOrCopy).toHaveBeenCalled();
  });
});
