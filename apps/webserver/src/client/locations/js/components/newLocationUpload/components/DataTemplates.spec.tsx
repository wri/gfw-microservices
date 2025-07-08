import { render, screen, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTemplates } from './DataTemplates';

jest.mock('@mui/icons-material', () => {
  const actualIcons = jest.requireActual('@mui/icons-material');

  return {
    ...actualIcons,
    DownloadDone: (props: any) => <span data-testid="DownloadDoneIcon" {...props} />,
  };
});

afterEach(cleanup);

describe('DataTemplates', () => {
  const handleCloseMock = jest.fn();

  it('should render the component correctly', () => {
    render(<DataTemplates onClose={handleCloseMock} isOpen={true} />);
    expect(screen.getByText('Download data templates')).toBeInTheDocument();
  });

  it('should close the modal when the done button is clicked', async () => {
    render(<DataTemplates onClose={handleCloseMock} isOpen={true} />);

    await userEvent.click(screen.getByRole('button', { name: /done/i }));
    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  }, 10100);

  it('should download a template when the download button is clicked', async () => {
    render(<DataTemplates onClose={handleCloseMock} isOpen={true} />);

    const accordionItem = screen.getByText(/point spreadsheet/i);
    await userEvent.click(accordionItem);

    const button = screen.getAllByRole('button', {
      name: /download/i,
    })[1];

    window.open = jest.fn();
    await userEvent.click(within(button).getByText(/download/i));
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('GFWPro-Spreadsheet.csv'));
  }, 10100);

  it('should show a check icon after downloading a template', async () => {
    render(<DataTemplates onClose={handleCloseMock} isOpen={true} />);

    const accordionItem = screen.getByText(/polygon kml/i);
    await userEvent.click(accordionItem);

    const button = screen.getByRole('button', {
      name: /kml download/i,
    });

    window.open = jest.fn();
    await userEvent.click(within(button).getByText(/download/i));

    expect(screen.getByTestId('DownloadDoneIcon')).toBeInTheDocument();
  }, 10100);

  it('should show "See more" when hovering over an accordion item', async () => {
    render(<DataTemplates onClose={handleCloseMock} isOpen={true} />);

    expect(screen.queryByText('See more')).not.toBeInTheDocument();
    await userEvent.hover(screen.getByText('Point Shapefile'));
    expect(screen.getByText('See more')).toBeInTheDocument();
  });
});
