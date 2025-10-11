/**
 * Turns blob into base64
 */
export default async function blobReader(data: Blob): Promise<string> {
	return await new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = async () => {
			if (reader.result) resolve(reader.result as string);
			else reject(new Error("error getting file"));
		};
		reader.onerror = (e) => reject(e);
		reader.readAsDataURL(data);
	});
}

/**
 * generates a preview string from base64 use in conjunction with blobReader
 */
export function generatePreview(base64String: string, fileType: string) {
	if (base64String.includes("data:")) return base64String;
	const _preview = `data:${fileType};base64,${base64String}`;

	return _preview;
}






// export const compressImage = async (
// 	file: File,
// 	{ quality = 1, type = file.type }: { quality?: number; type?: string } = {}
// ): Promise<File> => {
// 	// Get as image data
// 	const imageBitmap = await createImageBitmap(file);

// 	// Draw to canvas
// 	const canvas = document.createElement("canvas");
// 	canvas.width = imageBitmap.width;
// 	canvas.height = imageBitmap.height;
// 	const ctx = canvas.getContext("2d");
// 	if (ctx) {
// 		ctx.drawImage(imageBitmap, 0, 0);

// 		// Turn into Blob
// 		const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
// 		if (blob) {
// 			// Turn Blob into File
// 			const compressedImage = new File([blob], file.name, {
// 				type: blob.type,
// 			});

// 			return compressedImage;
// 		} else {
// 			throw new Error("Failed to create Blob from canvas.");
// 		}
// 	} else {
// 		throw new Error("Canvas rendering context is not available.");
// 	}
// };
