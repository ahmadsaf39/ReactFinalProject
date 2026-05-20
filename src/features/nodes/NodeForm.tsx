import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, MenuItem, TextField } from '@mui/material';
import type { Node } from '../../types/Node';

interface Props {
  initialData?: Node | null;
  onSubmit: (data: Omit<Node, 'id'>) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

const NODE_TYPES = ['Router', 'Switch', 'Host'] as const;

export default function NodeForm({ initialData = null, onSubmit, onCancel, loading = false }: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState(initialData?.type ?? NODE_TYPES[0]);
  const [errors, setErrors] = useState<{ name?: string; type?: string }>({});

  useEffect(() => {
    setName(initialData?.name ?? '');
    setType(initialData?.type ?? NODE_TYPES[0]);
    setErrors({});
  }, [initialData]);

  const typeOptions = useMemo(() => NODE_TYPES, []);

  const validate = () => {
    const e: typeof errors = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!type) e.type = 'Type is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;
    await onSubmit({ name: name.trim(), type });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 320 }}>
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={Boolean(errors.name)}
        helperText={errors.name}
        fullWidth
      />

      <TextField
        select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value)}
        error={Boolean(errors.type)}
        helperText={errors.type}
        fullWidth
      >
        {typeOptions.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 1 }}>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="contained" type="submit" disabled={loading}>
          Save
        </Button>
      </Box>
    </Box>
  );
}
export const NodeForm = () => {
  return <div>NodeForm</div>
}
