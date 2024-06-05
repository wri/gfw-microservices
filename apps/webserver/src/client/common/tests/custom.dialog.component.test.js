import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import CustomDialog from '../js/components/CustomDialog/CustomDialog';
import Button from '../Button';

jest.mock('../Button', () => ({ className, variant, label, onClick }) => (
  <button className={className} onClick={onClick}>
    {label}
  </button>
));

describe('CustomDialog', () => {
  const closeAction = jest.fn();
  const dialogActionConfirm = jest.fn();
  const dialogTitle = 'Test Dialog Title';
  const dialogMessage = '<p>Test Dialog Message</p>';

  it('renders correctly when open', () => {
    render(
      <CustomDialog
        open={true}
        closeAction={closeAction}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        dialogActionConfirm={dialogActionConfirm}
      />
    );

    expect(screen.getByText('Test Dialog Title')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog Message')).toBeInTheDocument();
  });

  it('calls closeAction when Cancel button is clicked', () => {
    render(
      <CustomDialog
        open={true}
        closeAction={closeAction}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        dialogActionConfirm={dialogActionConfirm}
      />
    );

    fireEvent.click(screen.getByText('Cancel'));
    expect(closeAction).toHaveBeenCalled();
  });

  it('calls dialogActionConfirm when OK button is clicked', () => {
    render(
      <CustomDialog
        open={true}
        closeAction={closeAction}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        dialogActionConfirm={dialogActionConfirm}
      />
    );

    fireEvent.click(screen.getByText('OK'));
    expect(dialogActionConfirm).toHaveBeenCalled();
  });

  it('does not render when open is false', () => {
    render(
      <CustomDialog
        open={false}
        closeAction={closeAction}
        dialogTitle={dialogTitle}
        dialogMessage={dialogMessage}
        dialogActionConfirm={dialogActionConfirm}
      />
    );

    expect(screen.queryByText('Test Dialog Title')).not.toBeInTheDocument();
    expect(screen.queryByText('OK')).not.toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    expect(screen.queryByText('Test Dialog Message')).not.toBeInTheDocument();
  });
});
