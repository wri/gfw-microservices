import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import MapRecenterButton from '../../../js/components/modals/MapRecenterButton';

describe('MapRecenterButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('should not render the button initially', () => {
    render(<MapRecenterButton selectedList={[]} goToOriginalPoint={() => {}} />);
    expect(screen.queryByTestId('map-center-button')).toBeNull();
  });

  test('should render the button when selectedList has items', () => {
    render(<MapRecenterButton selectedList={[1, 2, 3]} goToOriginalPoint={() => {}} />);
    expect(screen.getByTestId('map-center-button')).toBeInTheDocument();
  });

  test('should call goToOriginalPoint when the button is clicked', () => {
    const goToOriginalPointMock = jest.fn();
    render(<MapRecenterButton selectedList={[1]} goToOriginalPoint={goToOriginalPointMock} />);
    
    const button = screen.getByTestId('map-center-button');
    fireEvent.click(button);
    
    expect(goToOriginalPointMock).toHaveBeenCalledTimes(1);
  });
});