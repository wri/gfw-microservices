import React from 'react';
import { render, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Verify from '../js/components/Verify';
import mock from 'xhr-mock';

describe('Test Verify Component', () => {
  beforeEach(() => {
    mock.setup();
    Object.defineProperty(window, 'location', {
      value: {
        href: '/verify',
      },
    });
  });

  afterEach(() => {
    mock.teardown();
    cleanup();
    jest.clearAllMocks();
  });

  const getAndClickVerifyButton = async () => {
    const { container } = render(<Verify />);
    const verifyButton = container.querySelector('.verify-section__verify-button').firstChild;

    expect(verifyButton).toBeTruthy();
    await fireEvent.click(verifyButton);
  };

  it('Rendering the Verify page should not throw', () => {
    expect(() => {
      render(<Verify />);
    }).not.toThrow();
  });

  it('Should call /auth/verifyLogin when click on Verify button.', async () => {
    const xhrMock = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      readyState: 4,
      status: 200,
      responseText: 'User',
    };

    jest.spyOn(window, 'XMLHttpRequest').mockImplementation(() => xhrMock);

    await getAndClickVerifyButton();

    expect(xhrMock.open).toBeCalledWith('POST', '/auth/verifyLogin', true);
    expect(window.location.href).toEqual('/verify');
  });

  it('Should redirect User to /locations', async () => {
    mock.post('/auth/verifyLogin', { status: 200, body: 'User' });

    await getAndClickVerifyButton();
    await waitFor(() => expect(window.location.href).toEqual('/locations'));
  });

  it('Should redirect Select Org to /select', async () => {
    mock.post('/auth/verifyLogin', { status: 200, body: 'Select Org' });

    await getAndClickVerifyButton();

    await waitFor(() => expect(window.location.href).toEqual('/select'));
  });

  it('Should redirect Manager to /pro-manager-list', async () => {
    mock.post('/auth/verifyLogin', { status: 200, body: 'Manager' });

    await getAndClickVerifyButton();

    await waitFor(() => expect(window.location.href).toEqual('/pro-manager-list'));
  });

  test('Should stay Lucas to /verify', async () => {
    mock.post('/auth/verifyLogin', { status: 200, body: 'Lucas!' });

    await getAndClickVerifyButton();

    waitFor(() => expect(window.location.href).toEqual('/verify'));
  });
});
