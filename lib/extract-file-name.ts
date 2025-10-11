

export default function extractFileName(fileUrl: string) {
	if (!fileUrl) return "";
	if (typeof fileUrl !== "string") return "";

	const splitted = fileUrl?.split("/");
	return splitted[splitted?.length - 1];
}
