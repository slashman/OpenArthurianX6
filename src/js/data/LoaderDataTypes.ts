//TODO: Use these types in Loader.js once it's migrated to TS

type AppearanceItem = {
	id: string;
	i: number;
	solid?: boolean;
}

type AppearanceMob = {
	id: string;
	u: number[];
	d: number[];
	l: number[];
	r: number[];
	asleep?: number;
}

export type AppearanceRecord = {
	tileset: string;
	items?: AppearanceItem[];
	mobs?: AppearanceMob[];
}

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
