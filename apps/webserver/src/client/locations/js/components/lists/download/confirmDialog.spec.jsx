import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConfirmDialog from './confirmDialog';

// useTransifexTranslation returns the source string unchanged in tests.
jest.mock('../../../../../hooks', () => ({
  useTransifexTranslation: (text) => text,
}));

describe('ConfirmDialog', () => {
  const defaultProps = {
    open: true,
    setDialogOpen: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('always renders the title, primary message and the "Got it" button', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(screen.getByText('List file Download')).toBeInTheDocument();
    expect(
      screen.getByText(
        "You have selected a list file for download. Please check your email for your data's download link."
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
  });

  it('closes the dialog when the "Got it" button is clicked', async () => {
    const setDialogOpen = jest.fn();
    render(<ConfirmDialog {...defaultProps} setDialogOpen={setDialogOpen} />);

    await userEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(setDialogOpen).toHaveBeenCalledWith(false);
  });

  it('closes the dialog when the de-emphasized close icon is clicked', async () => {
    const setDialogOpen = jest.fn();
    render(<ConfirmDialog {...defaultProps} setDialogOpen={setDialogOpen} />);

    await userEvent.click(screen.getByRole('button', { name: 'close' }));

    expect(setDialogOpen).toHaveBeenCalledWith(false);
  });

  it('does not render a disclaimer box when no custom message is provided', () => {
    render(<ConfirmDialog {...defaultProps} />);

    expect(document.querySelector('.dialog__disclaimer')).not.toBeInTheDocument();
  });

  it('renders the disclaimer below the primary message when a custom message is provided', () => {
    const Disclaimer = () => <span>Argentina disclaimer text</span>;
    render(<ConfirmDialog {...defaultProps} CustomDownloadConfirmationMessage={Disclaimer} />);

    // Primary message is still shown alongside the disclaimer.
    expect(
      screen.getByText(
        "You have selected a list file for download. Please check your email for your data's download link."
      )
    ).toBeInTheDocument();
    const disclaimer = screen.getByText('Argentina disclaimer text');
    expect(disclaimer).toBeInTheDocument();
    expect(disclaimer.closest('.dialog__disclaimer')).toBeInTheDocument();
  });
});
