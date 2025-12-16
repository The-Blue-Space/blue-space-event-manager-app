export const slugify = (text: string, separator: string = "_") => {
	if (!text) return "";
	return text
		.trim()
		.toLowerCase()
		.replace(/[^\w]+/g, separator);
};
