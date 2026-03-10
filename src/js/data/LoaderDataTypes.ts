//TODO: Use this type in Loader.js once it's migrated to TS

export type MobTypeRecord = {
	id: string;
	appearance: string;
	name: string;
	description?: string;
	hp: number;
	damage: number;
	defense: number;
	speed: number;
	corpse: string;
	weapon?: string;
	portrait?: string;
	alignment?: string;
	intent?: string;
	useEffect?: {
		type: string;
	};
	items?: {
		itemId: string;
		quantity: number;
	}[];
}
