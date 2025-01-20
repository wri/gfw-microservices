import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTemplates } from './DataTemplates';

// this test is failing probably due to a ts config missing
//  Module './UploadLocationContext' was resolved to '/apps/webserver/src/client/locations/js/components/newLocationUpload/contexts/UploadLocationContext.tsx', but '--jsx' is not set.

describe.skip('DataTemplates Component', () => {
  const handleCloseMock = jest.fn();

  beforeEach(() => {
    render(<DataTemplates handleClose={handleCloseMock} />);
  });

  it('should render the component correctly', () => {
    expect(screen.getByText('Download a template')).toBeInTheDocument();
  });

  it('should close the modal when the close button is clicked', async () => {
    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);
    expect(handleCloseMock).toHaveBeenCalledTimes(1);
  });

  it('should expand and collapse accordion items', async () => {
    const accordionItem = screen.getByText('Polygon Shapefile');
    await userEvent.click(accordionItem);
    expect(
      screen.getByText('Your polygon shapefile must be in the EPSG-4326 WGS 84 projection.')
    ).toBeInTheDocument();
    await userEvent.click(accordionItem);
    expect(
      screen.queryByText('Your polygon shapefile must be in the EPSG-4326 WGS 84 projection.')
    ).not.toBeInTheDocument();
  });

  it('should download a template when the download button is clicked', async () => {
    const accordionItem = screen.getByText('Spreadsheet');
    await userEvent.click(accordionItem);
    const downloadButton = screen.getByRole('button', { name: /download/i });
    window.open = jest.fn();
    await userEvent.click(downloadButton);
    expect(window.open).toHaveBeenCalledWith(expect.stringContaining('GFWPro-Spreadsheet.csv'));
  });

  it('should show a check icon after downloading a template', async () => {
    const accordionItem = screen.getByText('KML');
    await userEvent.click(accordionItem);
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await userEvent.click(downloadButton);
    expect(screen.getByTestId('CheckIcon')).toBeInTheDocument();
  });

  it('should show "See more" when hovering over an accordion item', async () => {
    const accordionItem = screen.getByText('Point Shapefile');
    fireEvent.mouseEnter(accordionItem);
    expect(screen.getByText('See more')).toBeInTheDocument();
  });

  it('should change the button text to "Done" after downloading at least one template', async () => {
    const accordionItem = screen.getByText('List of Palm Mill IDs');
    await userEvent.click(accordionItem);
    const downloadButton = screen.getByRole('button', { name: /download/i });
    await userEvent.click(downloadButton);
    expect(screen.getByRole('button', { name: /done/i })).toBeInTheDocument();
  });
});
