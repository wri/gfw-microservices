import { render, screen } from '@testing-library/react';
import { HelperTextWithPopover } from './HelperTextWithPopover';
import userEvent, { UserEvent } from '@testing-library/user-event';

describe('HelperTextWithPopover', () => {
  let user: UserEvent;

  beforeEach(() => (user = userEvent.setup()));

  it('should render correctly', async () => {
    render(
      <HelperTextWithPopover label="custom label">
        <h1>Children Test</h1>
      </HelperTextWithPopover>
    );

    expect(screen.getByText(/custom label/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', {
        name: /close popover/i,
      })
    ).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /open popover/i,
      })
    );

    expect(screen.getByRole('heading', { name: /children test/i })).toBeInTheDocument();
  });

  it('should display the close button', async () => {
    render(
      <HelperTextWithPopover label="custom label" isCloseButtonVisible>
        <h1>Children Test</h1>
      </HelperTextWithPopover>
    );

    const openPopoverButton = screen.getByRole('button', {
      name: /open popover/i,
    });
    await user.click(openPopoverButton);

    expect(screen.getByRole('heading', { name: /children test/i })).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', {
        name: /close popover/i,
      })
    );

    expect(screen.queryByRole('heading', { name: /children test/i })).not.toBeInTheDocument();
  });
});
