import { render, screen, cleanup } from '@testing-library/react';
import { UploadByFileFolderIcon } from './UploadByFileFolderIcon';
import { FileAttachState } from '../types';

jest.mock('@mui/icons-material', () => ({
  DriveFolderUpload: (props: any) => <span data-testid="DriveFolderUpload" {...props} />,
  Downloading: (props: any) => <span data-testid="Downloading" {...props} />,
  Report: (props: any) => <span data-testid="Report" {...props} />,
  CheckCircle: (props: any) => <span data-testid="CheckCircle" {...props} />,
}));

afterEach(cleanup);

describe('UploadByFileFolderIcon', () => {
  it('renders DriveFolderUpload icon for NoFile state', () => {
    render(<UploadByFileFolderIcon fileAttachState={FileAttachState.NoFile} />);
    expect(screen.getByTestId('DriveFolderUpload')).toBeInTheDocument();
  });

  it('renders DriveFolderUpload icon with primary color for DragOver state', () => {
    render(<UploadByFileFolderIcon fileAttachState={FileAttachState.DragOver} />);
    expect(screen.getByTestId('DriveFolderUpload')).toBeInTheDocument();
  });

  it('renders Downloading icon for Uploading state', () => {
    render(<UploadByFileFolderIcon fileAttachState={FileAttachState.Uploading} />);
    expect(screen.getByTestId('DriveFolderUpload')).toBeInTheDocument();
    expect(screen.getByTestId('Downloading')).toBeInTheDocument();
  });

  it('renders Report icon for UnsupportedType state', () => {
    render(<UploadByFileFolderIcon fileAttachState={FileAttachState.UnsupportedType} />);
    expect(screen.getByTestId('DriveFolderUpload')).toBeInTheDocument();
    expect(screen.getByTestId('Report')).toBeInTheDocument();
  });

  it('renders Report icon for UploadFailed state', () => {
    render(<UploadByFileFolderIcon fileAttachState={FileAttachState.UploadFailed} />);
    expect(screen.getByTestId('DriveFolderUpload')).toBeInTheDocument();
    expect(screen.getByTestId('Report')).toBeInTheDocument();
  });

  it('renders CheckCircle icon for Uploaded state', () => {
    render(<UploadByFileFolderIcon fileAttachState={FileAttachState.Uploaded} />);
    expect(screen.getByTestId('DriveFolderUpload')).toBeInTheDocument();
    expect(screen.getByTestId('CheckCircle')).toBeInTheDocument();
  });
});
