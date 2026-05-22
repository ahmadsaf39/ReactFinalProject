import { useMemo, useState } from 'react';
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkTable from './LinkTable';
import LinkForm from './LinkForm';
import useLinks from '../../hooks/useLinks';
import useNodes from '../../hooks/useNodes';
import type { Link, LinkPayload } from '../../types/Link';
import type { Node } from '../../types/Node';

export default function LinksPage() {
	const { nodes, loading: nodesLoading } = useNodes();
	const {
		links,
		loading: linksLoading,
		createLink,
		updateLink,
		deleteLink,
	} = useLinks();

	const [open, setOpen] = useState(false);
	const [selectedLink, setSelectedLink] = useState<Link | null>(null);

	const nodesById = useMemo<Record<number, Node>>(() => {
		const map: Record<number, Node> = {};
		for (const n of nodes) map[n.id] = n;
		return map;
	}, [nodes]);

	const handleAdd = () => {
		setSelectedLink(null);
		setOpen(true);
	};

	const handleEdit = (link: Link) => {
		setSelectedLink(link);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setSelectedLink(null);
	};

	const handleSave = async (data: LinkPayload) => {
		if (selectedLink) {
			await updateLink(selectedLink.id, data);
		} else {
			await createLink(data);
		}
		handleClose();
	};

	const handleDelete = async (link: Link) => {
		const srcName = nodesById[link.sourceNodeId]?.name ?? `#${link.sourceNodeId}`;
		const dstName = nodesById[link.destinationNodeId]?.name ?? `#${link.destinationNodeId}`;
		const ok = window.confirm(`Delete link "${srcName} → ${dstName}"?`);
		if (!ok) return;
		await deleteLink(link.id);
	};

	const loading = linksLoading || nodesLoading;
	const canAdd = nodes.length >= 2;

	return (
		<Box sx={{ p: 2 }}>
			<Box
			sx={{
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				mb: 3,
			}}
		>
			<Box>
				<Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
					Links
				</Typography>
				<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
					Manage connections between network nodes
				</Typography>
			</Box>
			<Button
				startIcon={<AddIcon />}
				variant="contained"
				onClick={handleAdd}
				disabled={!canAdd}
				title={canAdd ? '' : 'Create at least two nodes first'}
				sx={{
					bgcolor: '#3b82f6',
					'&:hover': { bgcolor: '#2563eb' },
				}}
			>
				Add Link
			</Button>
		</Box>

			{loading && links.length === 0 ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
					<CircularProgress />
				</Box>
			) : (
				<LinkTable
					links={links}
					nodesById={nodesById}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}

			<Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
				<DialogTitle>{selectedLink ? 'Edit Link' : 'Add Link'}</DialogTitle>
				<DialogContent>
					<LinkForm
						key={selectedLink?.id ?? 'new'}
						initialData={selectedLink}
						nodes={nodes}
						onCancel={handleClose}
						onSubmit={handleSave}
						loading={loading}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
