/* eslint-disable import/no-unresolved */
/* eslint-disable react/jsx-filename-extension */
import { render, cleanup } from '@testing-library/react';
import React from 'react';

import LoadingWheel from '../js/components/Loaders/LoadingWheel';

describe('Test Loading Wheel Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Should not throw exception when rendering the ModalWrapper ', () => {
    expect(() => {
      render(<LoadingWheel />);
    }).not.toThrow();
  });

  it("Should toggle the display based on the 'active' property", () => {
    const { rerender, container } = render(<LoadingWheel />);
    expect(container.querySelector('div')).toHaveStyle('display: none');
    rerender(<LoadingWheel active />);
    expect(container.querySelector('div')).toHaveStyle('display: block');
  });

  it('Should change the fill color from #555555 to #F00', () => {
    const { rerender, container } = render(<LoadingWheel active />);
    let pathElement = container.querySelectorAll('path')[1];
    expect(pathElement).toHaveStyle('fill: #555555');
    rerender(<LoadingWheel active fill="#F00" />);
    [, pathElement] = container.querySelectorAll('path');
    expect(pathElement).toHaveStyle('fill: #F00');
  });
});
