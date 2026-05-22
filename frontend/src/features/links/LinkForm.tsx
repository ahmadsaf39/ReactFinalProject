import { useState, type FormEvent } from 'react';
import {
	Box,
	Button,
	FormControlLabel,
	MenuItem,
	Switch,
	TextField,
} from '@mui/material';
import type { Node } from '../../types/Node';
import type { Link, LinkPayload } from '../../types/Link';

interface Props {
	initialData?: Link | null;
	nodes: Node[];
	onSubmit: (data: LinkPayload) => void | Promise<void>;
	onCancel: () => void;
	loading?: boolean;
}

interface FormErrors {
	sourceNodeId?: string;
	destinationNodeId?: string;
	cost?: string;
}

export default function LinkForm({
	initialData = null,
	nodes,
	onSubmit,
	onCancel,
	loading = false,
}: Props) {
	const [sourceNodeId, setSourceNodeId] = useState<number | ''>(
		initialData?.sourceNodeId ?? '',
	);
	const [destinationNodeId, setDestinationNodeId] = useState<number | ''>(
		initialData?.destinationNodeId ?? '',
	);
	const [cost, setCost] = useState<string>(
		initialData?.cost != null ? String(initialData.cost) : '1',
	);
	const [isActive, setIsActive] = useState<boolean>(
		initialData?.isActive ?? true,
	);
	const [errors, setErrors] = useState<FormErrors>({});

	const validate = (): FormErrors => {
		const next: FormErrors = {};
		if (sourceNodeId === '') next.sourceNodeId = 'Source is required';
		if (destinationNodeId === '') next.destinationNodeId = 'Destination is required';
		if (
			sourceNodeId !== '' &&
			destinationNodeId !== '' &&
			sourceNodeId === destinationNodeId
		) {
			next.destinationNodeId = 'Destination must differ from source';
		}
		const costNum = Number(cost);
		if (!cost || Number.isNaN(costNum)) {
			next.cost = 'Cost is required';
		} else if (costNum < 1) {
			next.cost = 'Cost must be at least 1';
		}
		return next;
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		const next = validate();
		setErrors(next);
		if (Object.keys(next).length > 0) return;

		const payload: LinkPayload = {
			sourceNodeId: Number(sourceNodeId),
			destinationNodeId: Number(destinationNodeId),
			cost: Number(cost),
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
				minWidth: 360,
				pt: 1,
			}}
		>
			<TextField
				select
				label="Source Node"
				value={sourceNodeId}
				onChange={(e) =>
					setSourceNodeId(e.target.value === '' ? '' : Number(e.target.value))
				}
				error={Boolean(errors.sourceNodeId)}
				helperText={errors.sourceNodeId}
				fullWidth
			>
				{nodes.length === 0 && (
					<MenuItem value="" disabled>
						No nodes available
					</MenuItem>
				)}
				{nodes.map((n) => (
					<MenuItem key={n.id} value={n.id}>
						{n.name} (#{n.id})
					</MenuItem>
				))}
			</TextField>

			<TextField
				select
				label="Destination Node"
				value={destinationNodeId}
				onChange={(e) =>
					setDestinationNodeId(
						e.target.value === '' ? '' : Number(e.target.value),
					)
				}
				error={Boolean(errors.destinationNodeId)}
				helperText={errors.destinationNodeId}
				fullWidth
			>
				{nodes.length === 0 && (
					<MenuItem value="" disabled>
						No nodes available
					</MenuItem>
				)}
				{nodes.map((n) => (
					<MenuItem key={n.id} value={n.id}>
						{n.name} (#{n.id})
					</MenuItem>
				))}
			</TextField>

			<TextField
				label="Cost"
				type="number"
				value={cost}
				onChange={(e) => setCost(e.target.value)}
				error={Boolean(errors.cost)}
				helperText={errors.cost ?? 'Must be at least 1'}
				slotProps={{ htmlInput: { min: 1, step: 'any' } }}
				fullWidth
			/>

			<FormControlLabel
				control={
					<Switch
						checked={isActive}
						onChange={(e) => setIsActive(e.target.checked)}
					/>
				}
				label="Active"
			/>

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
