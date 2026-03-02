import { render, waitFor } from '@testing-library/react';

import Header from '.';

describe('Header', () => {
  it('Should render a simple header wrapped around an app bar', () => {
    const { container, getByText } = render(<Header />);

    expect(container.querySelector('div')).toBeInTheDocument();
    expect(container.querySelector('a')).toBeInTheDocument();
    expect(getByText('About')).toBeInTheDocument();
    expect(getByText('Blog')).toBeInTheDocument();
  });

  it('Should render a simple header with a link in it', async () => {
    const props = { links: { logout: true } };
    const { container, getByText } = render(<Header {...props} />);
    expect(container.querySelector('a')).toBeInTheDocument();
    expect(getByText('Locations')).toBeInTheDocument();
    expect(getByText('Map')).toBeInTheDocument();
    expect(getByText('Alerts')).toBeInTheDocument();
    await waitFor(() => {
      const spanElement = container.querySelector(
        '.new-feature-notifications__unread-notifications'
      );
      expect(spanElement).toBeInTheDocument();
      expect(spanElement.textContent).toBe('1');
    });
  });
});
