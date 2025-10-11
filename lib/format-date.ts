import { format, parseISO } from 'date-fns';

export function formatDateToYYYYMMDD(dateString: string) {
	// Check if the dateString matches the expected format YYYY-MM-DD
	const dateFormatRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (dateFormatRegex.test(dateString)) {
		return dateString; // Return the string as is if it matches the format
	}

	const date = new Date(dateString);

	// Get year, month, and day
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
	const day = String(date.getDate()).padStart(2, "0");

	return `${year}-${month}-${day}`;
}

export function formatDateToDDMMMYY(dateString: string) {
	const date = new Date(dateString);

	// Month abbreviations
	const monthAbbreviations = [
		"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
	];

	// Get day, month, and year
	const day = String(date.getDate()).padStart(2, "0");
	const month = monthAbbreviations[date.getMonth()]; // Months are 0-indexed
	const year = String(date.getFullYear()).slice(-2); // Get last 2 digits of year

	return `${day}-${month}-${year}`;
}

/**
 * Formats a date string to "Month DD, YYYY H:mmam/pm" format
 * Example: "July 8, 2025 6:50pm"
 */
export function formatDateToMMMMdYYYYhmmA(dateString: string | null): string {
	if (!dateString) return '';
	
	try {
		// Parse ISO string or create date from string
		const date = dateString.includes('T') ? parseISO(dateString) : new Date(dateString);
		
		// Format: "MMMM d, yyyy h:mmaaa"
		// MMMM = full month name (July)
		// d = day without leading zero (8)
		// yyyy = full year (2025)
		// h = hour in 12-hour format without leading zero (6)
		// mm = minutes with leading zero (50)
		// aaa = lowercase am/pm (pm)
		return format(date, 'MMMM d, yyyy h:mmaaa');
	} catch (error) {
		console.error('Error formatting date:', error);
		return dateString;
	}
}
