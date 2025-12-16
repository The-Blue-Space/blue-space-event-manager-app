import Cookies from "js-cookie";

type Options = Cookies.CookieAttributes;

type ReturnType = {
	get: <T>(key: string, defaultValue?: T) => T | undefined;
	set: <T>(key: string, value: T, options?: Options) => void;
	delete: (key: string) => void;
};

export default function useCookie(): ReturnType {
	const get = <T,>(key: string, defaultValue?: T): T | undefined => {
		try {
			const cookieValue = Cookies.get(key);
			return cookieValue ? JSON.parse(cookieValue) : defaultValue;
		} catch (error) {
			return defaultValue;
			throw error;
		}
	};

	const set = <T,>(key: string, value: T, options: Options = {}) => {
		try {
			Cookies.set(key, JSON.stringify(value), options);
		} catch (error) {
			throw error;
		}
	};

	const deleteCookie = (key: string) => {
		try {
			Cookies.remove(key);
		} catch (error) {
			throw error;
		}
	};

	return {
		get,
		set,
		delete: deleteCookie,
	};
}
