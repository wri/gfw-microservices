import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import CopyMoveModal from './CopyMoveModal';

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
  validLists: [{ list_name: 'List A' }, { list_name: 'List B' }],
};

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

describe('CopyMoveModal', () => {
  test('renders the modal with copy option selected', () => {
    render(<CopyMoveModal {...defaultProps} />);
    expect(screen.getByText('Copy')).toBeInTheDocument();
    expect(screen.getByText(/5 selected location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Copy/i)).toBeChecked();
  });

  test('allows changing from copy to move', () => {
    render(<CopyMoveModal {...defaultProps} selectedMoveOrCopy="move" />);
    expect(screen.getByText('Remove', { exact: false })).toBeInTheDocument();
    expect(screen.getByText(/5 selected locations/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Move/i)).toBeChecked();
  });

  test('renders the existing list dropdown', () => {
    render(<CopyMoveModal {...defaultProps} />);

    expect(screen.getByText('List A')).toBeInTheDocument();
    expect(screen.getByText('List B')).toBeInTheDocument();
  });

  test('calls setMoveOrCopy when selecting move', () => {
    render(<CopyMoveModal {...defaultProps} />);
    const moveRadio = screen.getByLabelText(/Move/i);
    fireEvent.click(moveRadio);

    expect(defaultProps.setMoveOrCopy).toHaveBeenCalled();
  });
});
