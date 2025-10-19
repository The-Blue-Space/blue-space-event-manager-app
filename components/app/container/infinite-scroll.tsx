import { PaginatedResponse } from "@/types/global.types";
import * as React from "react";
import { useInfiniteQuery, UseInfiniteQueryResult } from "@tanstack/react-query";
import ErrorBox from "../error-box";
import ErrorBoundary from "../error-boundary";
import LoadingBox from "../loading-box";

type InfiniteScrollProps<T> = {
	queryKey: (string | number | Record<string, any>)[];
	fetchData: (page: number) => Promise<PaginatedResponse<T>>;
	renderItem: (item: T, index: number) => React.ReactNode;
	emptyData: React.ReactNode;
	enabled?: boolean;
	threshold?: number; // Intersection observer threshold (0-1)
	rootMargin?: string; // Intersection observer root margin
	containerClassName?: string; // Class for items container
	loadingComponent?: React.ReactNode; // Custom loading component
	endReachedComponent?: React.ReactNode; // Custom "end reached" component
	onError?: (error: Error) => void; // Error callback
};

export default React.memo(function InfiniteScroll<T>({
	queryKey,
	fetchData,
	renderItem,
	emptyData,
	enabled = true,
	threshold = 1.0,
	rootMargin = "0px",
	containerClassName = "",
	loadingComponent,
	endReachedComponent,
	onError,
}: InfiniteScrollProps<T>) {
	const loaderRef = React.useRef<HTMLDivElement | null>(null);

	type Result = UseInfiniteQueryResult<PaginatedResponse<T>, Error>;

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isFetching,
		isError,
		error,
		isLoading,
	}: Result = useInfiniteQuery({
		queryKey,
		queryFn: async ({ pageParam }) => {
			const response = await fetchData(pageParam as number);
			return response;
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage) => {
			return lastPage.hasNextPage ? lastPage.nextPage : undefined;
		},
		enabled,

		retry: 2,
		refetchOnWindowFocus: false,
	});

	const handleObserver = React.useCallback(
		(entries: IntersectionObserverEntry[]) => {
			const target = entries[0];
			if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
				fetchNextPage();
			}
		},
		[fetchNextPage, hasNextPage, isFetchingNextPage]
	);

	React.useEffect(() => {
		const observer = new IntersectionObserver(handleObserver, {
			root: null,
			rootMargin,
			threshold,
		});
		const current = loaderRef.current;

		if (current) {
			observer.observe(current);
		}

		return () => {
			if (current) {
				observer.unobserve(current);
			}
		};
	}, [handleObserver, rootMargin, threshold]);

	React.useEffect(() => {
		if (isError && error && onError) {
			onError(error);
		}
	}, [isError, error, onError]);

	const items: T[] = (data as any)?.pages.flatMap((page: PaginatedResponse<T>) => page.docs) || [];

	// Show empty state if no data and not loading
	if (!isLoading && !isFetching && items.length === 0) {
		return <>{emptyData}</>;
	}

	return (
		<ErrorBoundary>
			<div className={containerClassName}>
				{items.map((item, index) => (
					<React.Fragment key={index}>{renderItem(item, index)}</React.Fragment>
				))}

				{/* Loading indicator for initial load or fetching next page */}
				{(isLoading || isFetchingNextPage) && (
					<div className="col-span-full flex w-full justify-center py-4">
						{loadingComponent || <LoadingBox />}
					</div>
				)}

				{/* End reached indicator */}
				{!hasNextPage && !isFetching && !isLoading && items.length > 0 && (
					<div className="col-span-full flex justify-center py- text-2xl text-neutral-400">
						{endReachedComponent || "..."}
					</div>
				)}

				{/* Error display */}
				{isError && error && (
					<div className="col-span-full">
						<ErrorBox error={error} />
					</div>
				)}

				{/* Intersection observer trigger element */}
				<div ref={loaderRef} style={{ height: "1px" }} />
			</div>
		</ErrorBoundary>
	);
}) as <T>(props: InfiniteScrollProps<T>) => React.ReactNode;
