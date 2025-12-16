"use client";
import TableFilter from "./table-filter";
import TableSearchBar from "./table-search-bar";

export type HeaderProps = {
	disabled: boolean;
};

export default function TableHeader(props: HeaderProps) {
	return (
		<div className="flex justify-between items-center py-4 border-b border-neutral-200">
			<div className="flex flex-1 gap-4 items-center">
				<TableFilter disabled={props.disabled} />
				<TableSearchBar disabled={props.disabled} />
			</div>
			
		</div>
	);
}
