import { render, screen, fireEvent } from '@testing-library/react';

import MapRecenterButton from '.';

describe('MapRecenterButton', () => {
  it('should not render the button initially', () => {
    render(<MapRecenterButton selectedList={[]} goToOriginalPoint={jest.fn()} />);
    expect(screen.queryByTestId('map-center-button')).toBeNull();
  });

  it('should render the button when selectedList has items', () => {
    render(<MapRecenterButton selectedList={[1, 2, 3]} goToOriginalPoint={jest.fn()} />);
    expect(screen.getByTestId('map-center-button')).toBeInTheDocument();
  });

  it('should call goToOriginalPoint when the button is clicked', () => {
    const goToOriginalPointMock = jest.fn();
    render(<MapRecenterButton selectedList={[1]} goToOriginalPoint={goToOriginalPointMock} />);

    const button = screen.getByTestId('map-center-button');
    fireEvent.click(button);

    expect(goToOriginalPointMock).toHaveBeenCalledTimes(1);
  });
});
