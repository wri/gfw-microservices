import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { NavBar } from '../components/NavBar';
import { UploadType } from '../types';
import { useUploadLocation } from '../contexts';

jest.mock('../contexts', () => ({
  useUploadLocation: jest.fn(),
}));

describe('NavBar', () => {
  it('should render steps for file upload when uploadType is ByFile', () => {
    (useUploadLocation as jest.Mock).mockReturnValue({
      clearUploadType: jest.fn(),
      uploadLocationState: { uploadType: UploadType.ByFile },
    });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', {
        name: /new location/i,
      })
    ).toBeInTheDocument();
    expect(screen.getByText(/prepare & upload/i)).toBeInTheDocument();
    expect(screen.getByText(/preview/i)).toBeInTheDocument();
    expect(screen.getByText(/configure list/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });

  it('should render steps for file upload when uploadType is ByPoint', () => {
    (useUploadLocation as jest.Mock).mockReturnValue({
      clearUploadType: jest.fn(),
      uploadLocationState: { uploadType: UploadType.ByPoint },
    });

    render(
      <BrowserRouter>
        // sorry, I failed to provide something useful
        <NavBar />
      </BrowserRouter>
    );

    expect(screen.getByText(/^Location$/)).toBeInTheDocument();
    expect(screen.queryByText(/preview/i)).not.toBeInTheDocument();
    expect(screen.getByText(/configure list/i)).toBeInTheDocument();
    expect(screen.getByText(/submit/i)).toBeInTheDocument();
  });

  it('should call clearUploadType when back button is clicked', async () => {
    const mockClearUploadType = jest.fn();
    (useUploadLocation as jest.Mock).mockReturnValue({
      clearUploadType: mockClearUploadType,
      uploadLocationState: { uploadType: UploadType.ByFile },
    });

    render(
      <BrowserRouter>
        <NavBar />
      </BrowserRouter>
    );

    await userEvent.click(screen.getByRole('button'));
    expect(mockClearUploadType).toHaveBeenCalledTimes(1);
  });

  it('should trigger the correction action for the back button to map', async () => {
    (useUploadLocation as jest.Mock).mockReturnValue({
      clearUploadType: jest.fn(),
      uploadLocationState: { uploadType: UploadType.ByPoint },
    });

    render(
      <BrowserRouter>
        <NavBar isComingFromMap />
      </BrowserRouter>
    );

    expect(
      screen.getByRole('heading', {
        name: /map/i,
      })
    ).toBeInTheDocument();

    const navigation = screen.getByRole('navigation');
    const button = within(navigation).getByRole('link');

    expect(button).toHaveAttribute('href', '/map');
  });
});
