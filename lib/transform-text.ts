export default function mergeText(...text: any[]) {
	if (!text) return;
	return text.join(" ");
}

export function splitText(text: string, separator: string, join = ",") {
	if (!text) return "";

	return text.trim().split(separator).join(join);
}
