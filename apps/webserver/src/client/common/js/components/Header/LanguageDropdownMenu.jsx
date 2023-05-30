import React, { useEffect, useState } from 'react';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Icon from '@material-ui/core/Icon';
import store from '../../../../locations/js/store';
import { setLanguage } from '../../../../locations/js/actions/locationActions';
import { getLanguageNameAbbreviation } from './getLanguageNameAbbreviation';
import './DropDownNav.scss';

const { Transifex } = window;

function LanguageDropdownMenu({ languageChange }) {
  const [displayOptions, setDisplayOptions] = useState(false);
  const [allLanguages, setAllLanguages] = useState();
  const [selectedLanguage, setSelectedLanguage] = useState();

  useEffect(() => {
    if (Transifex) {
      Transifex.live.onReady(() => {
        const languageCode = Transifex.live.getSelectedLanguageCode();
        const languages = Transifex.live.getAllLanguages();
        const selected = languages.find((language) => language.code === languageCode);

        setAllLanguages(languages);
        setSelectedLanguage(selected);
        store.dispatch(setLanguage(selected.code));
      });
    }
  }, []);

  const changeLanguage = (language) => {
    if (selectedLanguage.code !== language.code) {
      Transifex.live.translateTo(language.code);

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
      <div className={`drop-down-nav ${displayOptions ? 'drop-down-navv--selected' : ''}`}>
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
