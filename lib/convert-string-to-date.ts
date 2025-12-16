/**
 * Converts dd/mm/yyyy string to Date object
 */
export const convertStringToDate = (date: string) => {
	const parts = date.split("/");
	return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
};

/**
 * Converts ISO string to dd/mm/yyyy format
 */
export const convertISOStringToDDMMYYYY = (isoString: string) => {
	const date = new Date(isoString);
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};

/**
 * Converts Date object to dd/mm/yyyy format
 */
export const convertDateToDDMMYYYY = (date: Date) => {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	return `${day}/${month}/${year}`;
};

/**
 * Universal date converter - handles both directions
 * @param input - Can be dd/mm/yyyy string, ISO string, or Date object
 * @param outputFormat -  'iso' | 'ddmmyyyy'
 */
export const convertDate = (
	input: string | Date,
	outputFormat: "iso" | "ddmmyyyy" = "ddmmyyyy"
) => {
	if (!input) return "";
	if (typeof input !== "string" && !(input instanceof Date)) return "";
	let date: Date;

	// Convert input to Date object
	if (input instanceof Date) {
		date = input;
	} else if (input.includes("/")) {
		// Assume dd/mm/yyyy format
		date = convertStringToDate(input);
	} else {
		// Assume ISO string
		date = new Date(input);
	}

	// Convert to desired output format
	switch (outputFormat) {
		case "iso":
			return date.toISOString();
		case "ddmmyyyy":
			return convertDateToDDMMYYYY(date);
		default:
			throw new Error("Invalid output format");
	}
};
