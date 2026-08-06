import { useEffect, useState } from 'react';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Icon from '@mui/material/Icon';
import store from '../../../../locations/js/store';
import { setLanguage } from '../../../../locations/js/actions/locationActions';
import { getLanguageNameAbbreviation } from './getLanguageNameAbbreviation';
import './DropDownNav.scss';

function LanguageDropdownMenu({ languageChange }) {
  const [displayOptions, setDisplayOptions] = useState(false);
  const [allLanguages, setAllLanguages] = useState();
  const [selectedLanguage, setSelectedLanguage] = useState();

  useEffect(() => {
    const live = window.Transifex?.live;

    if (!live) {
      return;
    }

    const initializeLanguages = () => {
      const languageCode = live.getSelectedLanguageCode?.() || 'en';
      const languages = live.getAllLanguages?.() || [];
      const selected = languages.find((language) => language.code === languageCode) || languages[0];

      setAllLanguages(languages);
      setSelectedLanguage(selected);

      if (selected?.code) {
        store.dispatch(setLanguage(selected.code));
      }
    };

    initializeLanguages();
    live.onReady?.(initializeLanguages);
  }, []);

  const changeLanguage = (language) => {
    if (selectedLanguage?.code !== language.code) {
      window.Transifex?.live?.translateTo?.(language.code);

      setSelectedLanguage(language);
      store.dispatch(setLanguage(language.code));

      if (languageChange) {
        languageChange({
          selectedLanguage: language,
        });
        store.dispatch(setLanguage(language.code));
      }
    }

    setDisplayOptions(false);
  };

  return (
    <ClickAwayListener
      onClickAway={() => {
        if (displayOptions) {
          setDisplayOptions(false);
        }
      }}
    >
      <div className={`drop-down-nav ${displayOptions ? 'drop-down-nav--selected' : ''}`}>
        <button
          type="button"
          className="drop-down-nav__button"
          onClick={() => setDisplayOptions(!displayOptions)}
        >
          <span style={{ paddingRight: '5px' }}>
            {getLanguageNameAbbreviation(selectedLanguage?.code)}
          </span>
          <Icon style={{ fontSize: '14px' }}>language</Icon>
        </button>
        <div className={`drop-down-nav__list ${displayOptions ? 'show' : 'hide'}`}>
          {allLanguages &&
            allLanguages.map((language) => (
              <button
                type="button"
                key={language.code}
                className={`drop-down-nav__list-item ${
                  selectedLanguage?.name === language.name ? 'selected' : ''
                }`}
                onClick={() => changeLanguage(language)}
              >
                {language.name}
              </button>
            ))}
        </div>
      </div>
    </ClickAwayListener>
  );
}

export default LanguageDropdownMenu;
