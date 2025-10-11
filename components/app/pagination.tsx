import { PaginatedResponse } from "@/types/global.types";
import useCustomNavigation from "@/hooks/use-navigation";

export default function Pagination(props: PaginatedResponse<any>) {
	const { queryParams } = useCustomNavigation();
	const prev = props.hasPrevPage ? props.prevPage! : props.page;
	const next = props.hasNextPage ? props.nextPage! : props.page;
	const pageAfterNext = props.totalPages > next ? next + 1 : next;
	const page = props.page;

	const handlePageChange = (pageNumber: number) => {
		queryParams.set('page', pageNumber.toString());
	};

	return (
		<div className="flex items-center justify-center gap-5 px-5 border rounded-lg">
			<button
				onClick={() => handlePageChange(prev)}
				disabled={!props.hasPrevPage}
				className="flex items-center w-1/2 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span>Previous</span>{" "}
			</button>
			<div className="flex items-center grow [&_button]:px-3 [&_button]:py-1 [&_button]:border-x [&_button]:w-full [&_button]:transition ">
				<button
					onClick={() => handlePageChange(page)}
					className="bg-neutral-100"
				>
					{page}
				</button>
				{props.hasNextPage && (
					<button
						onClick={() => handlePageChange(next)}
						className="hover:bg-neutral-100"
					>
						{next}
					</button>
				)}
				{props.page < props.totalPages && (
					<button
						onClick={() => handlePageChange(pageAfterNext)}
						className="hover:bg-neutral-100"
					>
						...
					</button>
				)}
			</div>
			<button
				onClick={() => handlePageChange(next)}
				disabled={!props.hasNextPage}
				className="flex items-center w-1/2 gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
			>
				<span>Next</span>{" "}
			</button>
		</div>
	);
}
