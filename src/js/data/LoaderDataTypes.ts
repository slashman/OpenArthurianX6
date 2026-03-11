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

export type DialogCondition = {
	flag?: string;
	value?: any;
	joined?: boolean;
}

export type DialogRecord = {
	key: string;
	dialog?: string | string[] | any;
	variants?: {
		condition: DialogCondition;
		dialog: string | string[] | any;
	}[];
	synonym?: string;
}

export type ActionRecord = {
	type: string;
	text?: string;
	value?: any;
	flagName?: string;
	name?: string;
}

export type TriggerRecord = {
	id: string;
	type: string;
	value: number;
	actions: ActionRecord[];
}

export type ScheduleRecord = {
	id: string;
	time: number;
	location: {
		x: number;
		y: number;
	};
	action?: {
		type: string;
		hours?: number;
		once?: boolean;
	};
}

export type NPCRecord = {
	id: string;
	name: string;
	description?: string;
	type: string;
	alignment?: string;
	armor?: string;
	weapon?: string;
	backpack?: string;
	items?: {
		itemId: string;
		quantity: number;
	}[];
	intent?: string;
	triggers?: TriggerRecord[];
	schedule?: ScheduleRecord[];
	dialog?: DialogRecord[];
}
