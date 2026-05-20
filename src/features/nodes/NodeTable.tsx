import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Paper } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Node } from '../../types/Node';

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
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {nodes.map((node) => (
            <TableRow key={node.id} hover>
              <TableCell>{node.id}</TableCell>
              <TableCell>{node.name}</TableCell>
              <TableCell>{node.type}</TableCell>
              <TableCell align="right">
                <IconButton size="small" onClick={() => onEdit(node)} title="Edit">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={() => onDelete(node)} title="Delete">
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
export const NodeTable = () => {
  return <div>NodeTable</div>
}
