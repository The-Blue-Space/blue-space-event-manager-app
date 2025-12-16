/**
 * Converts form data to FormData for multipart/form-data submission,
 * handling nested objects with configurable notation (dot or bracket).
 */

export type FormDataNotation = "dot" | "bracket";

/**
 * Builds FormData from an object with configurable notation
 * @param data - The data object to convert
 * @param notation - Configuration options
 * @returns FormData instance
 */
export function buildFormData(
	data: Record<string, any>,
	notation: FormDataNotation = "dot"
): FormData {
	const formData = new FormData();

	function appendToFormData(obj: any, prefix: string = "") {
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				const value = obj[key];

				// Build the key based on notation type
				let fullKey: string;
				if (prefix) {
					fullKey = notation === "bracket" ? `${prefix}[${key}]` : `${prefix}.${key}`;
				} else {
					fullKey = key;
				}

				if (value === null || value === undefined) {
					// Optionally skip or set to empty string
					continue; // or formData.append(fullKey, '');
				} else if (typeof value === "object" && value instanceof File) {
					// Handle File objects directly
					formData.append(fullKey, value);
				} else if (typeof value === "object" && value.constructor === Object) {
					// Recurse into nested objects
					appendToFormData(value, fullKey);
				} else if (Array.isArray(value)) {
					// Flatten arrays
					value.forEach((item, index) => {
						if (typeof item === "object" && item.constructor === Object) {
							const arrayKey =
								notation === "bracket" ? `${fullKey}[${index}]` : `${fullKey}.${index}`;
							appendToFormData(item, arrayKey);
						} else {
							const arrayKey =
								notation === "bracket" ? `${fullKey}[${index}]` : `${fullKey}.${index}`;
							formData.append(arrayKey, String(item));
						}
					});
				} else {
					// Append primitive values as strings
					formData.append(fullKey, String(value));
				}
			}
		}
	}

	appendToFormData(data);
	return formData;
}
