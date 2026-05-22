import { useState } from 'react';
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
import NodeTable from './NodeTable';
import NodeForm from './NodeForm';
import useNodes from '../../hooks/useNodes';
import type { Node, NodePayload } from '../../types/Node';

export default function NodesPage() {
	const { nodes, loading, createNode, updateNode, deleteNode } = useNodes();
	const [open, setOpen] = useState(false);
	const [selectedNode, setSelectedNode] = useState<Node | null>(null);

	const handleAdd = () => {
		setSelectedNode(null);
		setOpen(true);
	};

	const handleEdit = (node: Node) => {
		setSelectedNode(node);
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
		setSelectedNode(null);
	};

	const handleSave = async (data: NodePayload) => {
		if (selectedNode) {
			await updateNode(selectedNode.id, data);
		} else {
			await createNode(data);
		}
		handleClose();
	};

	const handleDelete = async (node: Node) => {
		const ok = window.confirm(`Delete node "${node.name}"? All connected links will also be deleted.`);
		if (!ok) return;
		await deleteNode(node.id);
	};

	return (
		<Box>
			{/* Header — matches Dashboard/Routing/Simulation style */}
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
						Nodes
					</Typography>
					<Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.5 }}>
						Manage network nodes (routers, switches, customers)
					</Typography>
				</Box>
				<Button
					startIcon={<AddIcon />}
					variant="contained"
					onClick={handleAdd}
					sx={{
						bgcolor: '#3b82f6',
						'&:hover': { bgcolor: '#2563eb' },
					}}
				>
					Add Node
				</Button>
			</Box>

			{/* Loading or Table */}
			{loading && nodes.length === 0 ? (
				<Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
					<CircularProgress />
				</Box>
			) : (
				<NodeTable
					nodes={nodes}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			)}

			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				maxWidth="sm"
			>
				<DialogTitle>
					{selectedNode ? 'Edit Node' : 'Add Node'}
				</DialogTitle>
				<DialogContent>
					<NodeForm
						key={selectedNode?.id ?? 'new'}
						initialData={selectedNode}
						onCancel={handleClose}
						onSubmit={handleSave}
						loading={loading}
					/>
				</DialogContent>
			</Dialog>
		</Box>
	);
}
