import * as React from "react";
import { Search } from "lucide-react";
import useCustomNavigation from "@/hooks/use-navigation";

type TableSearchBarProps = {
	onSearch: (query: string) => void;
	disabled?: boolean;
};

export default React.memo(function TableSearchBar({ onSearch, disabled }: TableSearchBarProps) {
	const { queryParams } = useCustomNavigation();
	const [text, setText] = React.useState(queryParams.get("search") ?? "");
	const hasQuery = React.useMemo(() => queryParams.has("search"), [queryParams]);
	const handleSearch = () => {
		onSearch(text);
	};

	React.useEffect(() => {
		if (text === "" && hasQuery) queryParams.delete("search");
	}, [text, hasQuery]);

	// const hasQuery = React.useMemo(() => queryParams.has("search"), [queryParams]);

	// const search = () => {
	// 	navigate(`?search=${text}`);
	// };

	// React.useMemo(() => {
	// 	if (text === "" && hasQuery) queryParams.delete("search");
	// }, [hasQuery, text]);

	return (
		<div className="flex gap-3 items-center p-2 w-full rounded border max-w-80">
			<div className="cursor-pointer" onClick={handleSearch}>
				<Search className="size-5 text-neutral-500" />
			</div>
			<input
				type="search"
				name="search-bar"
				id="search-bar"
				placeholder="Search by ticket code or username"
				className="w-full outline-none placeholder:text-neutral-400 text-sm"
				onChange={(e) => setText(e.target.value.trim())}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleSearch();
					}
				}}
				value={text}
				disabled={disabled}
			/>
		</div>
	);
});
