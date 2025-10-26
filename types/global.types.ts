export type PaginatedResponse<T> = {
	docs: T[];
	totalDocs: number;
	limit: number;
	page: number;
	totalPages: number;
	hasNextPage: boolean;
	nextPage: number | null;
	hasPrevPage: boolean;
	prevPage: number | null;
	pagingCounter: number;
};

export type PaginationQuery = {
	page?: number;
	limit?: number;
	range?: string;
};

export type UploadMeta = {
	base64: string;
	url?: string;
	file_name: string;
	mime_type: string;
	file_size: number;
	type?: string;
};


export type Currency = {
	id: string;
	name: string;
	code: string;
	symbol: string;
};

export type Country = {
	id: string;
	country_name: string;
	country_code: string;
	country_flag: string;
	created_at: string;
	updated_at: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface DeepPartialArray<Thing> extends Array<DeepPartial<Thing>> {}

type DeepPartialObject<Thing> = {
	[Key in keyof Thing]?: DeepPartial<Thing[Key]>;
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type DeepPartial<Thing> = Thing extends Function
	? Thing
	: Thing extends Array<infer InferredArrayMember>
	? DeepPartialArray<InferredArrayMember>
	: Thing extends object
	? DeepPartialObject<Thing>
	: Thing | undefined;