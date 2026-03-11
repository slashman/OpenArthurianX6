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

export type ItemRecord = {
	id: string;
	appearance?: string;
	name: string;
	description?: string;
	damage?: number;
	defense?: number;
	throwable?: boolean;
	range?: number;
	flyType?: string;
	flyAppearance?: string;
	usesProjectileType?: string;
	stackLimit?: number;
	capacity?: number;
	closedAppearance?: string;
	openAppearance?: string;
	fixed?: boolean;
	linked?: {
		x: number;
		y: number;
	};
	isBook?: boolean;
	title?: string;
	contents?: string;
	effect?: {
		type: string;
		audioAssetKey?: string;
		offset?: number;
		timingType?: string;
		fragments?: number[];
		fragmentLength?: number;
		keys?: number;
		transformTo?: string;
		hungerRecovery?: number;
	};
	spendable?: boolean;
	useOnSelf?: boolean;
	type?: string;
	appearances?: {
		lit: string;
		off: string;
	};
	lightRadius?: number;
	solid?: boolean;
	containerType?: string;
}
