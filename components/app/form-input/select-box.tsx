import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import * as React from "react";
import classnames from "classnames";
import Input from "./input";

type SelectItem = {
	value: string;
	title: string;
};

type SelectBoxProps = {
	className?: string;
	containerStyle?: string;
	label?: string;
	options?: SelectItem[];
	showRestItem?: boolean;
	value?: string;
	onchange?: (item: string) => void;
	disabled?: boolean;
	contentMode?: "popper" | "item-aligned";
	side?: "top" | "bottom" | "left" | "right";
	placeholder?: string;
	name?: string;
	invalid?: boolean;
	required?: boolean;
	errorMessage?: string;
	errorStyle?: string;
	contentContainerStyle?: string;
	showSearch?: boolean;
};

export default React.memo(function SelectBox(props: SelectBoxProps) {
	const { required = false, disabled = false, showRestItem = false, showSearch = false } = props;
	const [search, setSearch] = React.useState("");

	const { isInvalid } = React.useMemo(() => {
		let isInvalid = false;
		const userInput = props.value?.toString();
		if (props.invalid && !userInput && props.required) {
			isInvalid = true;
		}
		return { isInvalid };
	}, [props.invalid, props.value, props.required]);

	const container = classnames("input-container !outline-0", props.containerStyle);

	const selectContainer = classnames(
		"shadow-none  w-full !outline-0 text-b-2 px-2 !h-auto text-neutral-500 capitalize",
		props.className,
		{
			"!text-neutral-500": !props.value?.trim(),
			invalid: isInvalid || !!props.errorMessage,
		}
	);

	const contentContainer = classnames("overflow-auto max-h-96", props.contentContainerStyle);
	const errorCn = classnames("text-red-500 text-xs", props.errorStyle, {
		hidden: !props.errorMessage,
	});

	const change = (val: string) => {
		if (!val.trim()) return;
		if (props.onchange) {
			props.onchange(val);
		}
	};

	const options = React.useMemo(() => {
		if (!props.options) return [];
		if (!search.trim()) return props.options ?? [];
		return (
			props.options?.filter(
				(item) =>
					item.title.toLowerCase().includes(search.toLowerCase()) ||
					item.value.toLowerCase().includes(search.toLowerCase())
			) ?? []
		);
	}, [props.options, search]);
	return (
		<React.Fragment>
			<div className={container}>
				{props.label && (
					<label htmlFor={props.name} className="">
						{props.label} <span className="text-red-500 ">{props.required && "*"}</span>
					</label>
				)}
				<Select
					value={props.value}
					onValueChange={change}
					name={props.name}
					disabled={disabled}
					required={required}
				>
					<SelectTrigger className={selectContainer}>
						<SelectValue className="capitalize" placeholder={props.placeholder ?? "Select Option"} />
					</SelectTrigger>
					<SelectContent
						position={props.contentMode}
						side={props.side}
						className={contentContainer}
						// onKeyDown={(e) => e.preventDefault()}
					>
						{showSearch && (
							<div className="flex flex-col gap-2 p-1">
								<Input
									placeholder="Search"
									value={search}
									onChange={(e) => {
										setSearch(e.target.value);
									}}
									onKeyDown={(e) => {
										e.stopPropagation();
									}}
								/>
							</div>
						)}
						{showRestItem && (
							<SelectItem value={" "} className="capitalize body-3">
								{props.placeholder ?? "Select Option"}
							</SelectItem>
						)}
						{options.map((item, idx) => (
							<SelectItem value={item.value} key={idx} className="capitalize body-3">
								{item.title}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				<small className={errorCn}>{props.errorMessage}</small>
			</div>
		</React.Fragment>
	);
});
