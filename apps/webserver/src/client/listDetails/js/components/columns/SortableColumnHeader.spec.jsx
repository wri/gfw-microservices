import { render, screen, fireEvent } from '@testing-library/react';
import SortableColumnHeader from './SortableColumnHeader';

describe('SortableColumnHeader', () => {
  it('renders the original header content', () => {
    render(
      <SortableColumnHeader onOpenMenu={jest.fn()}>
        <span>Size (ha)</span>
      </SortableColumnHeader>
    );
    expect(screen.getByText('Size (ha)')).toBeInTheDocument();
  });

  it('calls onOpenMenu when the trigger is clicked', () => {
    const onOpenMenu = jest.fn();
    render(
      <SortableColumnHeader onOpenMenu={onOpenMenu}>
        <span>Size (ha)</span>
      </SortableColumnHeader>
    );

    fireEvent.click(screen.getByLabelText('Open sort menu'));

    expect(onOpenMenu).toHaveBeenCalledTimes(1);
  });
});
