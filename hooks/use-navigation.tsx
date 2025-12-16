"use client";

import { useRouter, usePathname, useSearchParams, useParams } from "next/navigation";
import { useCallback } from "react";

const useCustomNavigation = () => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const params = useParams();
	const fullPathname = `${pathname}?${searchParams.toString()}`;

	// Query parameter utilities
	const queryUtils = {
		queries: searchParams,
		has: (name: string, value?: string) => searchParams.has(name, value),
		get: (name: string) => searchParams.get(name),
		getQueries: (names: string[]) => {
			return names.reduce((acc, key) => {
				const value = searchParams.get(key);
				if (value) acc[key] = value;
				return acc;
			}, {} as Record<string, string>);
		},
		set: (name: string, value: string,scroll: boolean = false) => {
			const params = new URLSearchParams(searchParams.toString());
			params.set(name, value);
			router.replace(`${pathname}?${params.toString()}`, { scroll });
		},
		setQueries: (queries: Record<string, string>,scroll: boolean = false) => {
			const params = new URLSearchParams(searchParams.toString());
			Object.entries(queries)
				.filter((item) => item[1] !== undefined && item[1] !== "")
				.forEach(([key, value]) => params.set(key, value));
			router.replace(`${pathname}?${params.toString()}`, { scroll });
		},
		append: (name: string, value: string,scroll: boolean = false) => {
			const params = new URLSearchParams(searchParams.toString());
			params.append(name, value);
			router.replace(`${pathname}?${params.toString()}`, { scroll });
		},
		deleteAndUpdate: (
			deleteString: string[],
			update: Record<string, string>,
			scroll: boolean = false
		) => {
			const params = new URLSearchParams(searchParams.toString());
			deleteString.forEach((name) => params.delete(name));
			Object.entries(update).forEach(([key, value]) => params.set(key, value));
			router.replace(`${pathname}?${params.toString()}`, { scroll });
		},
		delete: (name: string,scroll: boolean = false) => {
			const params = new URLSearchParams(searchParams.toString());
			params.delete(name);
			router.replace(`${pathname}?${params.toString()}`, { scroll });
		},
		deleteQueries: (names: string[],scroll: boolean = false) => {
			const params = new URLSearchParams(searchParams.toString());
			names.forEach((name) => params.delete(name));
			router.replace(`${pathname}?${params.toString()}`, { scroll });
		},
	};

	// Navigation utility
	const navigateTo = useCallback(
		(path: string | number, options?: { replace?: boolean }) => {
			if (typeof path === "number") {
				if (path === 0) {
					router.refresh();
					return;
				}
				router.back();
			} else {
				if (options?.replace) {
					router.replace(path, { scroll: false });
				} else {
					router.push(path, { scroll: false });
				}
			}
		},
		[router]
	);

	return {
		navigate: navigateTo,
		pathname,
		fullPathname,
		params,
		queryParams: queryUtils,
	};
};

export default useCustomNavigation;
