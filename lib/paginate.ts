import { PaginatedResponse } from "@/types/global.types";

type PaginatePayload<T> = {
	current_page: number;
	data: T[];
	first_page_url: string;
	from: number;
	last_page: number;
	last_page_url: string;
	next_page_url: string | null;
	path: string;
	per_page: number;
	prev_page_url: string | null;
	to: number;
	total: number;
};

export default function paginate<T>(params: PaginatePayload<T>): PaginatedResponse<T> {
	const page = params.current_page;
	const limit = Math.max(1, params.per_page);
	const offset = (Math.max(1, page) - 1) * limit;

	const totalDocs = params.total;
	const totalPages = Math.ceil(totalDocs / limit);
	const hasNextPage = page < totalPages;
	const hasPrevPage = page > 1;
	const docs = params.data;

	return {
		docs,
		totalDocs,
		limit,
		totalPages,
		page,
		pagingCounter: offset + 1,
		hasNextPage,
		hasPrevPage,
		nextPage: hasNextPage ? page + 1 : null,
		prevPage: hasPrevPage ? page - 1 : null,
	};
}


export function generatePaginateResponse<T>(data: T[]): PaginatedResponse<T> {
	return {
		docs: data,
		totalDocs: data.length,
		limit: 10,
		page: 1,
		totalPages: 1,
		hasNextPage: false,
		nextPage: null,
		hasPrevPage: false,
		prevPage: null,
		pagingCounter: 1,
	};
}
type PagedBody<T> = { data: T[]; page: { page: number; limit: number; total: number; pages: number } };

/** The server's list shape, `{data, page}`, as the portal's PaginatedResponse. */
export function fromPage<T>({ data, page }: PagedBody<T>): PaginatedResponse<T> {
	return {
		docs: data,
		totalDocs: page.total,
		limit: page.limit,
		page: page.page,
		totalPages: page.pages,
		hasNextPage: page.page < page.pages,
		nextPage: page.page < page.pages ? page.page + 1 : null,
		hasPrevPage: page.page > 1,
		prevPage: page.page > 1 ? page.page - 1 : null,
		pagingCounter: (page.page - 1) * page.limit + 1,
	};
}
