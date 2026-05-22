export interface Link {
	id: number;
	sourceNodeId: number;
	destinationNodeId: number;
	cost: number;
	isActive: boolean;
}

export type LinkPayload = Omit<Link, 'id'>;
