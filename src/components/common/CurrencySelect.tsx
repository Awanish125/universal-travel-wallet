'use client';

import React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { Box } from '@mui/material';
import { CURRENCIES, CurrencyItem } from '../../lib/currencies';

interface Props {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  label?: string;
}

export function CurrencySelect({ value, onChange, className, label }: Props) {
  const selectedOption = CURRENCIES.find(c => c.code === value) || undefined;

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-foreground mb-1">{label}</label>}
      <Autocomplete
        options={CURRENCIES}
        value={selectedOption}
        onChange={(event: any, newValue: any) => {
          if (newValue) {
            onChange(newValue.code);
          }
        }}
        getOptionLabel={(option) => `${option.code} - ${option.name}`}
        isOptionEqualToValue={(option, val) => option.code === val.code}
        autoHighlight
        disableClearable
        renderOption={(props, option) => (
          <Box component="li" sx={{ '& > span': { mr: 2, flexShrink: 0 } }} {...props}>
            <span>{option.flag}</span>
            {option.code} - {option.name}
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Select a currency"
            variant="outlined"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '0.75rem',
                backgroundColor: 'transparent',
                color: 'hsl(var(--foreground))',
                '& fieldset': {
                  borderColor: 'hsl(var(--border) / 0.5)',
                  borderWidth: '2px',
                },
                '&:hover fieldset': {
                  borderColor: 'hsl(var(--brand-accent))',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'hsl(var(--brand-accent))',
                },
              },
              '& .MuiInputBase-input': {
                color: 'hsl(var(--foreground))',
              },
              '& .MuiSvgIcon-root': {
                color: 'hsl(var(--foreground))',
              },
            }}
          />
        )}
      />
    </div>
  );
}
