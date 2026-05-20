import React, { useMemo, useState } from 'react';
import { Box, Button, Dialog, DialogContent, DialogTitle, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import NodeTable from './NodeTable';
import NodeForm from './NodeForm';
import useNodes from '../../hooks/useNodes';
import type { Node } from '../../types/Node';

export default function NodesPage() {
  const { nodes, loading, createNode, updateNode, deleteNode } = useNodes();
  const [open, setOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const openCreate = () => {
    setSelectedNode(null);
    setOpen(true);
  };

  const openEdit = (node: Node) => {
    setSelectedNode(node);
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async (data: Omit<Node, 'id'>) => {
    if (selectedNode) {
      await updateNode(selectedNode.id, data);
    } else {
      await createNode(data);
    }
    handleClose();
  };

  const handleDelete = async (node: Node) => {
    const ok = window.confirm(`Delete node "${node.name}"?`);
    if (!ok) return;
    await deleteNode(node.id);
  };

  const dialogTitle = useMemo(() => (selectedNode ? 'Edit Node' : 'Add Node'), [selectedNode]);

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Nodes</Typography>
        <Button startIcon={<AddIcon />} variant="contained" onClick={openCreate}>
          Add Node
        </Button>
      </Box>

      <NodeTable nodes={nodes} onEdit={openEdit} onDelete={handleDelete} />

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <NodeForm
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
export default function NodesPage() {
  return <div className="p-6">Nodes</div>;
}
