export const NodeType = {
	Router: 0,
	Switch: 1,
	Customer: 2,
} as const;

export type NodeType = (typeof NodeType)[keyof typeof NodeType];

export interface Node {
	id: number;
	name: string;
	type: NodeType;
	x: number;
	y: number;
	isActive: boolean;
}

export type NodePayload = Omit<Node, 'id'>;

export const NODE_TYPE_LABELS: Record<NodeType, string> = {
	[NodeType.Router]: 'Router',
	[NodeType.Switch]: 'Switch',
	[NodeType.Customer]: 'Customer',
};

export const NODE_TYPE_OPTIONS: { label: string; value: NodeType }[] = [
	{ label: 'Router', value: NodeType.Router },
	{ label: 'Switch', value: NodeType.Switch },
	{ label: 'Customer', value: NodeType.Customer },
];
