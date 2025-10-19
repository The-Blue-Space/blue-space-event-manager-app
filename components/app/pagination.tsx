import { PaginatedResponse } from "@/types/global.types";
import useCustomNavigation from "@/hooks/use-navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Pagination(props: PaginatedResponse<any>) {
	const { queryParams } = useCustomNavigation();
	const prev = props.hasPrevPage ? props.prevPage! : props.page;
	const next = props.hasNextPage ? props.nextPage! : props.page;

	const page = props.page;
	const totalPages = props.totalPages;

	const handlePageChange = (pageNumber: number) => {
		queryParams.set("page", pageNumber.toString(), true);
	};

	if (totalPages <= 1) return null; // No pagination needed

	const visiblePages = getVisiblePages(page, totalPages);

	return (
		<div className="flex justify-end py-5">
			<div className="flex items-center justify-end gap-5 px-5 w-fit">
				<button
					onClick={() => handlePageChange(prev)}
					disabled={!props.hasPrevPage}
					className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ArrowLeft size={16} className="hidden md:block" />
					<span>Previous</span>{" "}
				</button>
				<div className="flex items-center gap-2 grow [&_button]:px-3 [&_button]:py-1  [&_button]:w-full [&_button]:transition  [&_button]:rounded-lg ">
					{visiblePages.map((item, idx) => {
						if (item === "...") {
							return <span key={idx}>...</span>;
						}

						return (
							<button
								key={idx}
								onClick={() => handlePageChange(item)}
								className={cn("hover:bg-primary-800 hover:text-white transition-all duration-300", {
									"bg-primary-800 text-white": item === page,
								})}
								// disabled={item === page}
							>
								{item}
							</button>
						);
					})}
				</div>

				<button
					onClick={() => handlePageChange(next)}
					disabled={!props.hasNextPage}
					className="flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<span>Next</span> <ArrowRight size={16} className="hidden md:block" />
				</button>
			</div>
		</div>
	);
}

// Utility function to generate visible page numbers (dynamic based on current page)
function getVisiblePages(currentPage: number, totalPages: number): (number | "...")[] {
	if (totalPages <= 5) {
		// If few pages, show all without ellipsis
		return Array.from({ length: totalPages }, (_, i) => i + 1);
	}

	const pages: (number | "...")[] = [];

	// Always add first page
	pages.push(1);

	// Add ellipsis if current is far from start
	//   if (currentPage > 3) {
	//     pages.push("...");
	//   }

	// Add pages around current (window of 5: current-2 to current+2, clamped)
	const start = Math.max(2, currentPage - 2);
	const end = Math.min(totalPages - 1, currentPage + 2);
	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	// Add ellipsis if current is far from end
	if (currentPage < totalPages - 2) {
		pages.push("...");
	}

	// Always add last page
	pages.push(totalPages);

	return pages;
}
