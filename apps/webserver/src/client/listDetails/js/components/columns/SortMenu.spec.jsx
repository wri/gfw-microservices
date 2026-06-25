import { render, screen, fireEvent } from '@testing-library/react';
import SortMenu from './SortMenu';

describe('SortMenu', () => {
  const renderMenu = (props = {}) =>
    render(
      <SortMenu
        position={{ top: 100, left: 100 }}
        isSorted={false}
        isSortedDesc={false}
        onClose={jest.fn()}
        onSort={jest.fn()}
        {...props}
      />
    );

  it('renders the Ascending/Descending options when open', () => {
    renderMenu();
    expect(screen.getByText('Sort by')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /ascending/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /descending/i })).toBeInTheDocument();
  });

  it('renders nothing when there is no position', () => {
    render(
      <SortMenu
        position={null}
        isSorted={false}
        isSortedDesc={false}
        onClose={jest.fn()}
        onSort={jest.fn()}
      />
    );
    expect(screen.queryByText('Sort by')).not.toBeInTheDocument();
  });

  it('sorts ascending / descending when an option is selected', () => {
    const onSort = jest.fn();
    renderMenu({ onSort });

    fireEvent.click(screen.getByRole('menuitem', { name: /ascending/i }));
    expect(onSort).toHaveBeenCalledWith(false);

    fireEvent.click(screen.getByRole('menuitem', { name: /descending/i }));
    expect(onSort).toHaveBeenCalledWith(true);
  });

  it('marks the active direction as selected', () => {
    renderMenu({ isSorted: true, isSortedDesc: true });
    expect(screen.getByRole('menuitem', { name: /descending/i })).toHaveClass('Mui-selected');
    expect(screen.getByRole('menuitem', { name: /ascending/i })).not.toHaveClass('Mui-selected');
  });
});
