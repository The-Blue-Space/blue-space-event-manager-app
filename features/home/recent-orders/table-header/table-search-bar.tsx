import * as React from "react";
import { HeaderProps } from ".";
import useCustomNavigation from "@/hooks/use-navigation";

export default React.memo(function TableSearchBar(props: HeaderProps) {
	const [text, setText] = React.useState("");
	const { navigate, queryParams } = useCustomNavigation();

	const hasQuery = React.useMemo(() => queryParams.has("search"), [queryParams]);

	const search = () => {
		navigate(`?search=${text}`);
	};

	React.useMemo(() => {
		if (text === "" && hasQuery) queryParams.delete("search");
	}, [hasQuery, text]);

	return (
		<div className="flex gap-3 items-center p-2 w-full rounded border max-w-80">
			<div className="cursor-pointer" onClick={search}>
				{/* <Image
					src={text ? assets.search_icon_02 : assets.search_icon_01}
					alt="search icon"
					className="size-5"
				/> */}
			</div>
			<input
				type="search"
				name="search-bar"
				id="search-bar"
				placeholder="Search by compliance name"
				className="w-full outline-none placeholder:text-b-2 text-b-2"
				onChange={(e) => setText(e.target.value.trim())}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						search();
					}
				}}
				value={text}
				disabled={props.disabled}
			/>
		</div>
	);
});
