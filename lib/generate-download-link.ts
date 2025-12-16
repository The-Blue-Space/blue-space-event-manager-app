export function generateDownloadLink(path: string, filename: string) {
	const link = document.createElement("a");
	link.href = path; // Path to file in public directory
	link.download = filename; // Suggested filename for download
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
