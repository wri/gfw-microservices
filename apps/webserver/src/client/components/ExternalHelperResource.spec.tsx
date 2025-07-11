import { render, screen } from '@testing-library/react';
import { ExternalHelperResource } from './ExternalHelperResource';

describe('ExternalHelperResource', () => {
  it('should render the component with given text and URL', () => {
    const text = 'Help Center';
    const url = 'https://example.com/help';

    render(<ExternalHelperResource text={text} url={url} color="info" />);

    const link = screen.getByRole('link', { name: /help center/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', url);
  });
});
