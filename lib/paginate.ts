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

// {
//     "status": true,
//     "message": "Transactions Retrieved Successfully",
//     "data": {
//         "current_page": 1,
//         "data": [],
//         "first_page_url": "http://127.0.0.1:8000/api/account/transactions?page=1",
//         "from": 1,
//         "last_page": 1,
//         "last_page_url": "http://127.0.0.1:8000/api/account/transactions?page=1",
//         "links": [
//             {
//                 "url": null,
//                 "label": "&laquo; Previous",
//                 "active": false
//             },
//             {
//                 "url": "http://127.0.0.1:8000/api/account/transactions?page=1",
//                 "label": "1",
//                 "active": true
//             },
//             {
//                 "url": null,
//                 "label": "Next &raquo;",
//                 "active": false
//             }
//         ],
//         "next_page_url": null,
//         "path": "http://127.0.0.1:8000/api/account/transactions",
//         "per_page": 20,
//         "prev_page_url": null,
//         "to": 2,
//         "total": 2
//     },
//     "status_code": 200
// }
