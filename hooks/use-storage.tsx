type StorageType = "localStorage" | "sessionStorage";

type ReturnType = {
	get: <T>(key: string, defaultValue?: T, storageType?: StorageType) => T | undefined;
	set: <T>(key: string, value: T, storageType?: StorageType) => void;
	delete: (key: string, storageType?: StorageType) => void;
};

export default function useStorage(): ReturnType {
	const get = <T,>(
		key: string,
		defaultValue?: T,
		storageType: StorageType = "sessionStorage"
	): T | undefined => {
		try {
			if (typeof window !== "undefined") {
				return window[storageType].getItem(key)
					? JSON.parse(window[storageType].getItem(key) as string)
					: defaultValue;
			}
			return defaultValue;
		} catch (error) {
			console.error(`Error reading from ${storageType}:`, error);
			return defaultValue;
		}
	};

	const set = <T,>(key: string, value: T, storageType: StorageType = "sessionStorage") => {
		try {
			if (typeof window !== "undefined") {
				window[storageType].setItem(key, JSON.stringify(value));
			}
		} catch (error) {
			throw error;
		}
	};

	const deleteValue = (key: string, storageType: StorageType = "sessionStorage") => {
		try {
			if (typeof window !== "undefined") {
				window[storageType].removeItem(key);
			}
		} catch (error) {
			throw error;
		}
	};

	return {
		get,
		set,
		delete: deleteValue,
	};
}


