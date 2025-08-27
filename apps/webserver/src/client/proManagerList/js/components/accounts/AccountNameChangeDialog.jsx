import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  TextField,
} from '@mui/material';
import FieldLabel from './FieldLabel';

export default function AccountNameChangeDialog({ open, initialValue = '', onClose, onSave }) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [error, setError] = useState('');
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);

  useEffect(() => {
    setInputValue(initialValue);
    setIsSaveEnabled(false);
    setError('');
  }, [initialValue, open]);

  const handleInputChange = (val) => {
    setInputValue(val);
    setIsSaveEnabled(val.trim().length > 0);
    setError('');

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(async () => {
      if (!val.trim()) {
        return;
      }
      
      try {
        const res = await fetch('/pro-manager/checkOrgName', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ name: val }),
        });
        const data = await res.json();
        if (data.exists) {
          setError('This name already exists. Please provide a new organization name.');
        }
      } catch (err) {
        console.error(err);
      }
    }, 500);

    setTypingTimeout(timeout);
  };

  const handleSave = () => {
    onSave(inputValue.trim(), setError);
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: { minWidth: '525px' } }}>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
        }}
      >
        Organization Name Change
        <Button
          onClick={onClose}
          sx={{
            minWidth: 'auto',
            padding: '3px 4px',
            color: '#333333',
            border: '1px solid lightgray',
            borderRadius: '3px',
            backgroundColor: 'lightgray',
            fontWeight: 'bold',
            lineHeight: 1,
            '&:hover': { backgroundColor: 'white' },
          }}
        >
          ✕
        </Button>
      </DialogTitle>
      <Divider sx={{ borderColor: '#ccc', margin: 0 }} />
      <DialogContent sx={{ paddingTop: '1rem' }}>
        <FieldLabel htmlFor="modal_org_name">
          <span style={{ color: 'red' }}>*</span> New Organization Name
        </FieldLabel>
        <TextField
          fullWidth
          id="modal_org_name"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          error={!!error}
          helperText={error}
          placeholder="Enter new organization name"
          size="small"
          variant="outlined"
        />
      </DialogContent>
      <DialogActions sx={{ padding: '1rem' }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!isSaveEnabled || !!error} onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
