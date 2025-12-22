import * as React from "react";
import { Search } from "lucide-react";

type TableSearchBarProps = {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
};

export default React.memo(function TableSearchBar(props: TableSearchBarProps) {
	const [text, setText] = React.useState(props.value || "");

	React.useEffect(() => {
		setText(props.value || "");
	}, [props.value]);

	React.useEffect(() => {
		if (text === "" && props.value !== "") {
			props.onChange("");
		}
	}, [text, props.value, props.onChange]);

	const handleSearch = () => {
		props.onChange(text);
	};

	return (
		<div className="flex gap-3 items-center px-3 py-2 w-full rounded-lg border border-neutral-300 max-w-80 bg-white focus-within:border-primary-500 transition-colors">
			<Search
				className="h-4 w-4 text-neutral-500 cursor-pointer flex-shrink-0"
				onClick={handleSearch}
			/>
			<input
				type="search"
				name="search-bar"
				id="search-bar"
				placeholder={props.placeholder || "Search refunds..."}
				className="w-full outline-none text-sm text-neutral-900 placeholder:text-neutral-400"
				onChange={(e) => setText(e.target.value.trim())}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						handleSearch();
					}
				}}
				value={text}
				disabled={props.disabled}
			/>
		</div>
	);
});
