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
	Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import type { Link } from '../../types/Link';
import type { Node } from '../../types/Node';

interface Props {
	links: Link[];
	nodesById: Record<number, Node>;
	onEdit: (link: Link) => void;
	onDelete: (link: Link) => void;
}

const resolveName = (nodesById: Record<number, Node>, id: number): string =>
	nodesById[id]?.name ?? `#${id}`;

export default function LinkTable({ links, nodesById, onEdit, onDelete }: Props) {
	return (
		<TableContainer component={Paper}>
			<Table size="small">
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Source</TableCell>
						<TableCell />
						<TableCell>Destination</TableCell>
						<TableCell>Cost</TableCell>
						<TableCell>Status</TableCell>
						<TableCell align="right">Actions</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{links.length === 0 && (
						<TableRow>
							<TableCell colSpan={7} align="center">
								<Typography variant="body2" sx={{ py: 2, opacity: 0.7 }}>
									No links yet
								</Typography>
							</TableCell>
						</TableRow>
					)}
					{links.map((link) => (
						<TableRow key={link.id} hover>
							<TableCell>{link.id}</TableCell>
							<TableCell>{resolveName(nodesById, link.sourceNodeId)}</TableCell>
							<TableCell>
								<ArrowRightAltIcon fontSize="small" />
							</TableCell>
							<TableCell>{resolveName(nodesById, link.destinationNodeId)}</TableCell>
							<TableCell>{link.cost}</TableCell>
							<TableCell>
								<Chip
									size="small"
									label={link.isActive ? 'Active' : 'Inactive'}
									color={link.isActive ? 'success' : 'default'}
								/>
							</TableCell>
							<TableCell align="right">
								<IconButton
									size="small"
									onClick={() => onEdit(link)}
									title="Edit"
								>
									<EditIcon fontSize="small" />
								</IconButton>
								<IconButton
									size="small"
									onClick={() => onDelete(link)}
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
