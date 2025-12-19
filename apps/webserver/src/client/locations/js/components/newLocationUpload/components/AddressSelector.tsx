import { useState, useCallback } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import debounce from 'lodash.debounce';
import { FieldError } from 'react-hook-form';
import errorLogger from '../../../../../common/js/utils/errorLogger';

interface AddressSelectorProps {
  onResultSelect: (latitude: number, longitude: number) => void;
  onClearValue: () => void;
  error: FieldError | undefined;
}

export function AddressSelector({ onResultSelect, onClearValue, error }: AddressSelectorProps) {
  const [options, setOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (query: string) => {
    const API_URL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest';
    const params = new URLSearchParams({
      f: 'json',
      text: query,
      maxSuggestions: '5',
    });

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?${params.toString()}`);
      const data = await response.json();
      if (data?.suggestions) {
        onClearValue();
        setOptions(data.suggestions.map((suggestion: { text: string }) => suggestion.text));
      }
    } catch (error) {
      errorLogger.apiError(error, {
        endpoint: API_URL,
        method: 'GET',
        component: 'AddressSelector',
        action: 'fetchSuggestions',
      });
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((query: string) => {
      fetchSuggestions(query);
    }, 500),
    []
  );

  const fetchCoordinates = async (selectedValue: string) => {
    const API_URL =
      'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates';
    const params = new URLSearchParams({
      f: 'json',
      singleLine: selectedValue,
      outFields: 'location',
    });

    try {
      const response = await fetch(`${API_URL}?${params.toString()}`);
      const data = await response.json();
      if (data?.candidates?.length > 0) {
        const location = data.candidates[0].location;
        onResultSelect(location.y, location.x);
      }
    } catch (error) {
      errorLogger.apiError(error, {
        endpoint:
          'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates',
        method: 'GET',
        component: 'AddressSelector',
        action: 'fetchCoordinates',
      });
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      loading={loading}
      onInputChange={(_, value, reason) => {
        if (reason === 'input' && value.trim()) {
          debouncedFetchSuggestions(value);
        } else {
          setOptions([]);
          onClearValue();
        }
      }}
      onChange={(_, value) => {
        if (value) {
          fetchCoordinates(value);
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          error={!!error}
          helperText={error && 'Enter a valid address'}
          sx={{
            '& .MuiOutlinedInput-root': {
              padding: 0,
              '& fieldset': {
                border: 'none',
              },
              '& input': {
                border: (theme) => `1px solid ${error ? theme.palette.error.main : 'unset'}`,
              },
            },
          }}
        />
      )}
    />
  );
}
