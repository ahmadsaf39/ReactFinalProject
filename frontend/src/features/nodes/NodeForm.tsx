import { useState, type FormEvent } from 'react';
import { Box, Button, MenuItem, TextField, Typography } from '@mui/material';
import {
  NODE_TYPE_OPTIONS,
  NodeType,
  type Node,
  type NodePayload,
} from '../../types/Node';

interface Props {
  initialData?: Node | null;
  onSubmit: (data: NodePayload) => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export default function NodeForm({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
}: Props) {
  const [name, setName] = useState(initialData?.name ?? '');
  const [type, setType] = useState<NodeType>(
    initialData?.type ?? NodeType.Router,
  );
  const [x, setX] = useState<string>(
    initialData?.x != null ? String(initialData.x) : '0',
  );
  const [y, setY] = useState<string>(
    initialData?.y != null ? String(initialData.y) : '0',
  );
  const [isActive] = useState<boolean>(initialData?.isActive ?? true);
  const [nameError, setNameError] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmed = name.trim();
    if (!trimmed) {
      setNameError('Name is required');
      return;
    }
    setNameError('');

    const payload: NodePayload = {
      name: trimmed,
      type,
      x: Number(x) || 0,
      y: Number(y) || 0,
      isActive,
    };

    await onSubmit(payload);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minWidth: 320,
        pt: 1,
      }}
    >
      <TextField
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={Boolean(nameError)}
        helperText={nameError}
        fullWidth
        autoFocus
      />

      <TextField
        select
        label="Type"
        value={type}
        onChange={(e) => setType(Number(e.target.value) as NodeType)}
        fullWidth
      >
        {NODE_TYPE_OPTIONS.map((t) => (
          <MenuItem key={t.value} value={t.value}>
            {t.label}
          </MenuItem>
        ))}
      </TextField>

      {/* Coordinate fields for graph visualization */}
      <Box>
        <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
          Position (for graph visualization)
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="X"
            type="number"
            value={x}
            onChange={(e) => setX(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { step: 'any' } }}
          />
          <TextField
            label="Y"
            type="number"
            value={y}
            onChange={(e) => setY(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { step: 'any' } }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          gap: 1,
          justifyContent: 'flex-end',
          mt: 1,
        }}
      >
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
