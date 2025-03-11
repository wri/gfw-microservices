import React from 'react';
import { render, cleanup, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import Page from '../js/components/Page';

describe('Test Page Component', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('Rendering the Page component should not throw', () => {
    expect(() => {
      render(<Page />);
    }).not.toThrow();
  });

  it('Should contain children passed into it', () => {
    const { container } = render(
      <Page>
        <div className="sample-content" />
      </Page>
    );
    expect(container.querySelector('.sample-content')).toBeTruthy();
  });

  it('Should not display mobile header when the user is logged in', async () => {
    let actContainer;
    act(() => {
      const { container } = render(
        <Page
          links={{
            logout: true,
          }}
          active="profile"
        />
      );
      actContainer = container;
    });
    await waitFor(() => {
      expect(actContainer.querySelector('.header--mobile')).not.toBeInTheDocument();
    });
  });

  it('Should display mobile header when the user is logged in', async () => {
    let actContainer;
    act(() => {
      const { container } = render(
        <Page
          links={{
            logout: false,
          }}
          active="profile"
        />
      );
      actContainer = container;
    });

    expect(actContainer.querySelector('.header--mobile')).toBeTruthy();
  });

  it('Should contain a Header when no props are passed in', () => {
    const { container } = render(<Page />);

    expect(container.querySelector('.header')).toBeTruthy();
    expect(container.querySelector('.header__container')).toBeTruthy();
    expect(container.querySelector('.logo')).toBeTruthy();
    expect(container.querySelector('.app__body')).toBeTruthy();
  });

  xit('Should not contain a login Header when the active prop is account (or login)', () => {
    const { container } = render(<Page active="account" />);
    expect(container.querySelector('.header')).toBeFalsy();
    expect(container.querySelector('.app__body')).toBeTruthy();
  });

  it('Footer should be hidden when we are not on the login screen', () => {
    const { container, rerender } = render(<Page />);
    expect(container.querySelector('.hidden')).toBeTruthy();
    rerender(<Page active="lucas" />);
    expect(container.querySelector('.hidden')).toBeTruthy();
  });
});
