import React, { useEffect, useState } from 'react';
import Accordion from '@mui/material/Accordion';
import LanguageIcon from '@mui/icons-material/Language';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { setLanguage } from '../../../../../locations/js/actions/locationActions';
import store from '../../../../../locations/js/store';

const { Transifex } = window;

function LanguageDropdownMenuMobile({ languageChange }) {
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
  };
  const notSelectedLanguages = allLanguages?.filter((language) => selectedLanguage?.name !== language.name);
  return (
    <Accordion
      sx={{
        width: '100%',
        '&:before': {
          display: 'none', // removes shadow in accordion
        },
      }}
      elevation={0}
    >
      <AccordionSummary sx={{ boxShadow: 0 }} expandIcon={<ExpandMoreIcon />}>
        <LanguageIcon />
        <Typography sx={{ textTransform: 'uppercase', pl: 1 }}>{selectedLanguage?.name}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {notSelectedLanguages &&
          notSelectedLanguages.map((language) => (
            <MenuItem key={language.code} onClick={() => changeLanguage(language)} sx={{ textTransform: 'uppercase' }}>
              {language.name}
            </MenuItem>
          ))}
      </AccordionDetails>
    </Accordion>
  );
}

export default LanguageDropdownMenuMobile;
