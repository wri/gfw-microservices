import React, { useEffect, useState } from 'react';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { locationsPage } from '../../../../common/js/config';
import './ExistingListSelector.scss';

function ExistingListSelector({ templateId, existingListSelectionHandler }) {
  const [lists, setLists] = useState([]);
  const [value, setValue] = useState();

  useEffect(() => {
    const url = templateId ? `/getUserLists?templateId=${templateId}` : '/getUserLists';

    fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then(({ userLists }) => {
        setLists(userLists);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [templateId]);

  useEffect(() => {
    existingListSelectionHandler(value);
  }, [value, existingListSelectionHandler]);

  return (
    <div className="existing-list-selector">
      <div className="label">{locationsPage.add.addToAnExistingList}</div>
      <Autocomplete
        options={lists}
        getOptionLabel={(option) => option.list_name}
        value={value || null}
        onChange={(event, newValue) => {
          setValue(newValue);
        }}
        sx={{ width: '100%', border: 'none', '& fieldset': { border: 'none' } }}
        renderInput={(params) => <TextField {...params} />}
      />
    </div>
  );
}

export default ExistingListSelector;
