import * as React from "react";
import useCustomNavigation from "@/hooks/use-navigation";
import buildQueryString from "@/lib/build-query-string";

type FilterFormData = {
	status: string;
};

const initial: FilterFormData = {
	status: "",
};

export type FilterFormProps = {
	formData: FilterFormData;
	change: (key: keyof FilterFormData, value: string) => void;
	isLoading: boolean;
};

export default function useTableFilter() {
	const { queryParams, navigate, pathname } = useCustomNavigation();
	const getInitial = () => {
		const initialValues = {} as FilterFormData;
		Object.keys(initial).forEach((key) => {
			const value = queryParams.get(key);
			initialValues[key as keyof FilterFormData] = value || initial[key as keyof FilterFormData];
		});
		return initialValues;
	};
	const [formData, setFormData] = React.useState<FilterFormData>(getInitial());
	const [isLoading, setIsLoading] = React.useState(false);

	const resetQueries = () => {
		navigate(`${pathname}`);

		setFormData(initial);
	};

	const reset = () => {
		if (isLoading) return;
		resetQueries();
	};

	const change = (key: keyof FilterFormData, value: string) => {
		if (isLoading) return;
		setFormData((prev) => ({ ...prev, [key]: value }));
	};

	const submit = () => {
		setIsLoading(true);
		const filtered = Object.fromEntries(Object.entries(formData).filter((item) => item[1] !== ""));
		const query = buildQueryString(filtered);
		navigate(`${pathname}?${query}`);

		setIsLoading(false);
	};

	return { formData, change, submit, reset, isLoading };
}
