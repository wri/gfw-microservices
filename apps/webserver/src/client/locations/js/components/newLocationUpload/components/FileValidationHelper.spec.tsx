import { render, screen } from '@testing-library/react';
import { FileValidationHelper } from './FileValidationHelper';
import userEvent from '@testing-library/user-event';

describe('FileValidationHelper', () => {
  it('should render correctly', () => {
    render(<FileValidationHelper />);

    screen.logTestingPlaygroundURL();

    expect(screen.getByText(/how do we validate your file for upload\?/i)).toBeInTheDocument();
  });

  it('should trigger popover on button click', async () => {
    render(<FileValidationHelper />);

    const titleText = /file validation process:/i;
    const button = screen.getByRole('button', {
      name: /open popover/i,
    });

    expect(screen.queryByText(titleText)).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.queryByText(titleText)).toBeInTheDocument();
    expect(
      screen.getByText(
        /initial check\. this ensures your file is formatted correctly and has the necessary obligatory columns for the data type you are uploading\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /after submitting for analysis we run a validation to check if your locations are on land and have valid geometries\. if they do not, we notify you about errors in your upload\./i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /after submitting for analysis we run a validation to check if your locations are on land and have valid geometries\. if they do not, we notify you about errors in your upload\./i
      )
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {
        name: /close popover/i,
      })
    );

    expect(screen.queryByText(titleText)).not.toBeInTheDocument();
  });
});
