import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import store from '../../../../locations/js/store';
import LanguageDropdownMenu from './LanguageDropdownMenu';

jest.mock('../../../../locations/js/store', () => ({
  __esModule: true,
  default: {
    dispatch: jest.fn(),
  },
}));

describe('LanguageDropdownMenu', () => {
  const originalTransifex = window.Transifex;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.Transifex = originalTransifex;
  });

  it('renders safely when Transifex is unavailable', () => {
    delete window.Transifex;

    const { container } = render(<LanguageDropdownMenu />);

    const button = container.querySelector('.drop-down-nav__button');
    expect(button).toBeInTheDocument();

    fireEvent.click(button);
    expect(container.querySelectorAll('.drop-down-nav__list-item')).toHaveLength(0);
  });

  it('initializes languages and translates when selecting a new language', async () => {
    const translateTo = jest.fn();
    const onReady = jest.fn();

    window.Transifex = {
      live: {
        getSelectedLanguageCode: jest.fn(() => 'en'),
        getAllLanguages: jest.fn(() => [
          { code: 'en', name: 'English' },
          { code: 'es_MX', name: 'Spanish' },
        ]),
        onReady,
        translateTo,
      },
    };

    const { container } = render(<LanguageDropdownMenu />);

    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ data: 'en' }));
    });

    const button = container.querySelector('.drop-down-nav__button');
    fireEvent.click(button);
    fireEvent.click(screen.getByRole('button', { name: 'Spanish' }));

    expect(translateTo).toHaveBeenCalledWith('es_MX');
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ data: 'es_MX' }));
  });
});
