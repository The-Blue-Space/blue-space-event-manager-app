import useCustomNavigation from "@/hooks/use-navigation";
import buildQueryString from "@/lib/build-query-string";

import * as React from "react";
import { toast } from "sonner";

export type FilterFormData = {
	search: string;
	category: string;
	access_type: string;
	published: string;
	start_date: string;
	end_date: string;
	sort_by: string;
	sort_order: string; // "asc" | "desc";
};

export type FilterFormProps = {
	formData: FilterFormData;
	change: (key: keyof FilterFormData, value: string) => void;
	isLoading: boolean;
};

const initial: FilterFormData = {
	search: "",
	category: "",
	access_type: "",
	published: "",
	start_date: "",
	end_date: "",
	sort_by: "newest",
	sort_order: "desc",
};

export default function useEventsFilter() {
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
		const data = formData;
		if (data.start_date) {
			if (!data.end_date) {
				data.end_date = new Date().toISOString();
			}

			if (data.start_date > data.end_date) {
				toast.warning("Start date must be before end date", {
					description: "Please select a valid date range",
				});
				return;
			}
		}
		setIsLoading(true);
		const filtered = Object.fromEntries(Object.entries(formData).filter((item) => item[1] !== ""));
		const query = buildQueryString(filtered);
		navigate(`${pathname}?${query}`);
		setIsLoading(false);
	};

	return { formData, change, submit, reset, isLoading };
}
