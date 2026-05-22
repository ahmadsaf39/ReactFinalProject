import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	IconButton,
	Paper,
	Chip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { NODE_TYPE_LABELS, type Node } from '../../types/Node';

interface Props {
	nodes: Node[];
	onEdit: (node: Node) => void;
	onDelete: (node: Node) => void;
}

export default function NodeTable({ nodes, onEdit, onDelete }: Props) {
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Name</TableCell>
						<TableCell>Type</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{nodes.map((node) => (
						<TableRow key={node.id} hover>
							<TableCell>{node.id}</TableCell>
							<TableCell>{node.name}</TableCell>
							<TableCell>
								{NODE_TYPE_LABELS[node.type] ?? node.type}
							</TableCell>
							<TableCell>
								<Chip
									size="small"
									label={node.isActive ? 'Active' : 'Inactive'}
									color={node.isActive ? 'success' : 'default'}
								/>
							</TableCell>
							<TableCell align="right">
								<IconButton
									size="small"
									onClick={() => onEdit(node)}
									title="Edit"
								>
									<EditIcon fontSize="small" />
								</IconButton>
								<IconButton
									size="small"
									onClick={() => onDelete(node)}
									title="Delete"
								>
									<DeleteIcon fontSize="small" />
								</IconButton>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
