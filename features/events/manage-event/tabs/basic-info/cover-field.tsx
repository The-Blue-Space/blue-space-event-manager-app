"use client";
import * as React from "react";
import classNames from "classnames";
import { ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { compressImage } from "@/lib/compress-image";

type CoverFieldProps = { url?: string; onPick: (file: File) => void; onRemove: () => void };

const MAX_BYTES = 5 * 1024 * 1024;

/** The event's cover image: pick or drop one, replace it, or remove it. It uploads when the tab is saved. */
export default function CoverField({ url, onPick, onRemove }: CoverFieldProps) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [dragging, setDragging] = React.useState(false);

	const accept = async (file?: File) => {
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Choose a JPG or PNG image.");
			return;
		}
		const compressed = await compressImage(file);
		if (compressed.size > MAX_BYTES) {
			toast.error("That image is too large. Choose one under 5 MB.");
			return;
		}
		onPick(compressed);
	};

	const input = (
		<input
			ref={inputRef}
			type="file"
			accept="image/jpeg,image/png,image/webp"
			className="sr-only"
			tabIndex={-1}
			aria-hidden="true"
			onChange={(event) => {
				accept(event.target.files?.[0]);
				event.target.value = "";
			}}
		/>
	);
	const pickButton = (label: string) => (
		<button
			type="button"
			onClick={() => inputRef.current?.click()}
			className="h-10 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
		>
			{label}
		</button>
	);

	if (url) {
		return (
			<div className="grid gap-3">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={url} alt="Cover image" className="block aspect-[21/9] w-full rounded-xl object-cover" />
				<div className="flex gap-2">
					{pickButton("Replace cover")}
					<button
						type="button"
						onClick={onRemove}
						className="h-10 rounded-lg px-3 text-[14px] font-semibold text-auth-muted hover:text-auth-ink"
					>
						Remove
					</button>
				</div>
				{input}
			</div>
		);
	}

	return (
		<div
			onDragOver={(event) => {
				event.preventDefault();
				setDragging(true);
			}}
			onDragLeave={() => setDragging(false)}
			onDrop={(event) => {
				event.preventDefault();
				setDragging(false);
				accept(event.dataTransfer.files?.[0]);
			}}
			className={classNames(
				"flex aspect-[21/9] flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed bg-auth-page px-4 text-center",
				dragging ? "border-auth-link bg-auth-info-soft" : "border-auth-field"
			)}
		>
			<ImageIcon aria-hidden="true" className="size-7 text-auth-muted" strokeWidth={1.75} />
			{pickButton("Upload a cover image")}
			<span className="text-[13px] text-auth-muted">JPG or PNG, or drop it here</span>
			{input}
		</div>
	);
}
