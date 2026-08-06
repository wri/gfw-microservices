import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import store from '../../../../../locations/js/store';
import LanguageDropdownMenuMobile from './LanguageDropdownMenuMobile';

jest.mock('../../../../../locations/js/store', () => ({
  __esModule: true,
  default: {
    dispatch: jest.fn(),
  },
}));

describe('LanguageDropdownMenuMobile', () => {
  const originalTransifex = window.Transifex;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    window.Transifex = originalTransifex;
  });

  it('renders safely when Transifex is unavailable', () => {
    delete window.Transifex;

    const { container } = render(<LanguageDropdownMenuMobile />);

    expect(container.querySelector('[class*=MuiAccordion-root]')).toBeInTheDocument();
    expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
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

    render(<LanguageDropdownMenuMobile />);

    await waitFor(() => {
      expect(onReady).toHaveBeenCalledTimes(1);
      expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ data: 'en' }));
    });

    fireEvent.click(screen.getByRole('button', { name: /english/i }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Spanish' }));

    expect(translateTo).toHaveBeenCalledWith('es_MX');
    expect(store.dispatch).toHaveBeenCalledWith(expect.objectContaining({ data: 'es_MX' }));
  });
});
