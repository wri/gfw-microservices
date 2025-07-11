import { render, screen, fireEvent } from '@testing-library/react';
import CustomDialog from './CustomDialog';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

describe('CustomDialog', () => {
  const closeAction = jest.fn();
  const dialogActionConfirm = jest.fn();
  const dialogTitle = 'Test Dialog Title';
  const dialogMessage = '<p>Test Dialog Message</p>';

  it('renders correctly when open', () => {
    render(
      <MuiThemeProvider>
        <CustomDialog
          open={true}
          closeAction={closeAction}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          dialogActionConfirm={dialogActionConfirm}
        />
      </MuiThemeProvider>
    );

    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog Message')).toBeInTheDocument();
  });

  it('calls closeAction when Cancel button is clicked', () => {
    render(
      <MuiThemeProvider>
        <CustomDialog
          open={true}
          closeAction={closeAction}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          dialogActionConfirm={dialogActionConfirm}
        />
      </MuiThemeProvider>
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(closeAction).toHaveBeenCalled();
  });

  it('calls dialogActionConfirm when OK button is clicked', () => {
    render(
      <MuiThemeProvider>
        <CustomDialog
          open={true}
          closeAction={closeAction}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          dialogActionConfirm={dialogActionConfirm}
        />
      </MuiThemeProvider>
    );

    fireEvent.click(screen.getByText('OK'));
    expect(dialogActionConfirm).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    render(
      <MuiThemeProvider>
        <CustomDialog
          open={false}
          closeAction={closeAction}
          dialogTitle={dialogTitle}
          dialogMessage={dialogMessage}
          dialogActionConfirm={dialogActionConfirm}
        />
      </MuiThemeProvider>
    );

    expect(screen.queryByText('Test Dialog Title')).not.toBeInTheDocument();
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Dialog Message')).not.toBeInTheDocument();
  });
});
