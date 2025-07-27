import { render, screen, within } from '@testing-library/react';
import userEvent, { UserEvent } from '@testing-library/user-event';

import AnalysisFailedMessage from './AnalysisFailedMessage';

describe('AnalysisFailedMessage', () => {
  let user: UserEvent;

  beforeEach(() => {
    user = userEvent.setup();
  });

  it('should render the component', async () => {
    const mockToggleReRunAnalysisDialog = jest.fn();

    render(<AnalysisFailedMessage toggleReRunAnalysisDialog={mockToggleReRunAnalysisDialog} />);

    expect(screen.getByText('Analysis has failed')).toBeInTheDocument();
    const errorMessage = screen.getByText(
      /all your list's locations have failed analysis\. read more about how to avoid and address analysis failures \./i
    );
    expect(errorMessage).toBeInTheDocument();

    const linkByRole = within(errorMessage).getByRole('link', { name: 'here' });
    expect(linkByRole).toBeInTheDocument();
    expect(linkByRole).toHaveAttribute(
      'href',
      'https://globalforestwatch.org/help/gfw-pro/guides/how-to-address-errors-in-your-uploads'
    );

    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(mockToggleReRunAnalysisDialog).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('link', { name: /GFW Pro support here/i })).toHaveAttribute(
      'href',
      'https://gfwpro.zendesk.com/hc/en-us/requests/new'
    );
  });
});
