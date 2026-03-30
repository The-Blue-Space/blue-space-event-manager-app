/**
 * Client-side image compressor.
 *
 * Strategy:
 *  1. Skip compression entirely if the file is already under the target size.
 *  2. Cap the maximum dimension at 4096px (preserving aspect ratio).
 *  3. Prefer WebP output — ~25-35% smaller than JPEG at equal quality.
 *  4. Binary-search the quality value (0.5 – 0.92) to hit the target size
 *     in ~4 iterations instead of stepping blindly.
 *  5. If quality alone cannot reach the target, progressively scale down
 *     the canvas dimensions by 10% per pass until it fits.
 *
 * The result is visually near-lossless for typical event photos.
 */

export type ImageFormat = "webp" | "jpeg" | "auto";

export interface CompressImageOptions {
	/** Target output size in bytes. Defaults to 4.5 MB (safely under a 5 MB backend limit). */
	targetSizeBytes?: number;
	/** Maximum pixel dimension (width or height). Defaults to 4096. */
	maxDimension?: number;
	/** Starting quality (0–1). Binary search begins here and goes down. Defaults to 0.92. */
	quality?: number;
	/** Minimum quality the algorithm will try before switching to dimension scaling. Defaults to 0.5. */
	minQuality?: number;
	/** Preferred output format. "auto" picks WebP when supported, else JPEG. Defaults to "auto". */
	format?: ImageFormat;
}

const DEFAULT_TARGET = 4.5 * 1024 * 1024; // 4.5 MB
const DEFAULT_MAX_DIM = 4096;
const DEFAULT_QUALITY = 0.92;
const DEFAULT_MIN_QUALITY = 0.5;
const DIMENSION_STEP = 0.9; // scale factor per dimension-reduction pass

/** Returns true if the browser can encode WebP via canvas. */
function supportsWebP(): boolean {
	if (typeof document === "undefined") return false;
	const canvas = document.createElement("canvas");
	canvas.width = 1;
	canvas.height = 1;
	return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

/**
 * Draw an ImageBitmap onto a canvas at the given dimensions and return it
 * as a Blob in the specified format and quality.
 */
function canvasToBlob(
	bitmap: ImageBitmap,
	width: number,
	height: number,
	mimeType: string,
	quality: number
): Promise<Blob> {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;

	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("Canvas 2D context unavailable");
	ctx.drawImage(bitmap, 0, 0, width, height);

	return new Promise<Blob>((resolve, reject) => {
		canvas.toBlob(
			(blob) => {
				if (blob) resolve(blob);
				else reject(new Error("canvas.toBlob returned null"));
			},
			mimeType,
			quality
		);
	});
}

/**
 * Binary-search for the highest quality value that produces a blob under
 * `targetBytes`, within [minQ, maxQ].
 * Returns `null` if even `minQ` exceeds the target.
 */
async function binarySearchQuality(
	bitmap: ImageBitmap,
	width: number,
	height: number,
	mimeType: string,
	targetBytes: number,
	minQ: number,
	maxQ: number
): Promise<Blob | null> {
	let lo = minQ;
	let hi = maxQ;
	let best: Blob | null = null;

	// ~5 iterations is enough to converge within 0.03 quality units
	for (let i = 0; i < 5; i++) {
		const mid = (lo + hi) / 2;
		const blob = await canvasToBlob(bitmap, width, height, mimeType, mid);

		if (blob.size <= targetBytes) {
			best = blob;
			lo = mid; // can afford higher quality
		} else {
			hi = mid; // need lower quality
		}
	}

	return best;
}

/**
 * Compress an image File before upload.
 *
 * @param file    The original File object (jpeg, png, webp, gif, etc.)
 * @param options Compression options
 * @returns       A new File that fits within `targetSizeBytes`, or the
 *                original file if it was already small enough.
 */
export async function compressImage(
	file: File,
	options: CompressImageOptions = {}
): Promise<File> {
	const {
		targetSizeBytes = DEFAULT_TARGET,
		maxDimension = DEFAULT_MAX_DIM,
		quality: startQuality = DEFAULT_QUALITY,
		minQuality = DEFAULT_MIN_QUALITY,
		format = "auto",
	} = options;

	// 1. Already small enough — skip all work
	if (file.size <= targetSizeBytes) return file;

	// 2. Resolve output MIME type
	const mimeType =
		format === "webp"
			? "image/webp"
			: format === "jpeg"
			? "image/jpeg"
			: supportsWebP()
			? "image/webp"
			: "image/jpeg";

	// 3. Decode source image
	const bitmap = await createImageBitmap(file);
	const originalWidth = bitmap.width;
	const originalHeight = bitmap.height;

	// 4. Calculate initial render dimensions (cap at maxDimension)
	const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
	let renderWidth = Math.round(originalWidth * scale);
	let renderHeight = Math.round(originalHeight * scale);

	// 5. Try binary-search on quality at the initial dimensions
	const firstPass = await binarySearchQuality(
		bitmap,
		renderWidth,
		renderHeight,
		mimeType,
		targetSizeBytes,
		minQuality,
		startQuality
	);

	if (firstPass) {
		bitmap.close();
		return new File([firstPass], file.name, { type: mimeType });
	}

	// 6. Quality alone wasn't enough — progressively shrink dimensions
	let compressed: Blob | null = null;

	while (renderWidth > 100 && renderHeight > 100) {
		renderWidth = Math.round(renderWidth * DIMENSION_STEP);
		renderHeight = Math.round(renderHeight * DIMENSION_STEP);

		compressed = await binarySearchQuality(
			bitmap,
			renderWidth,
			renderHeight,
			mimeType,
			targetSizeBytes,
			minQuality,
			startQuality
		);

		if (compressed) break;
	}

	if (compressed) {
		bitmap.close();
		return new File([compressed], file.name, { type: mimeType });
	}

	// 7. Absolute fallback — return best effort at minimum quality + smallest dims
	// bitmap is still open here; close it after the final draw
	const fallback = await canvasToBlob(
		bitmap,
		renderWidth,
		renderHeight,
		mimeType,
		minQuality
	);
	bitmap.close();
	return new File([fallback], file.name, { type: mimeType });
}

/**
 * Compress multiple images concurrently.
 */
export async function compressImages(
	files: File[],
	options: CompressImageOptions = {}
): Promise<File[]> {
	return Promise.all(files.map((f) => compressImage(f, options)));
}
