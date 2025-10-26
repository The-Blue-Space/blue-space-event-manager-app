export type FORM_FIELDS = {
	name: string;
	type: INPUT_TYPES;
	label: string;
	placeholder: string;
	options?: SelectOptions[];
	required: boolean;
	readOnly?: boolean;
	containerStyle?: string;
	className?: string;
	accept?: string;
	note?: string;
};
export type SelectOptions = {
	title: string;
	value: string;
};
export type INPUT_TYPES =
	| "text"
	| "password"
	| "checkbox"
	| "radio"
	| "number"
	| "email"
	| "date"
	| "file"
	| "url"
	| "tel"
	| "color"
	| "range"
	| "search"
	| "time"
	| "datetime-local"
	// external
	| "select"
	| "textarea"
	| "layout"
	| "switch"
	| "select-country"
	| "select-currency"
	| "select-operating-country";
