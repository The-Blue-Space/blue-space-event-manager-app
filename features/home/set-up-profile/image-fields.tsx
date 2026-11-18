"use client";
import * as React from "react";
import Image from "next/image";
import classNames from "classnames";
import { ImageIcon, ImageUp } from "lucide-react";
import AppButton from "@/components/app/app-button";
import type { PickedImage } from "./use-set-up-profile";

type ImageFieldProps = {
	image: PickedImage | null;
	/** The saved image, shown until a new one is picked. Remove only undoes a new pick. */
	currentUrl?: string | null;
	onPick: (file: File) => void;
	onRemove: () => void;
};

const labelClass = "text-[13px] font-semibold text-auth-ink";
const optionalTag = <span className="font-medium text-auth-muted"> (optional)</span>;
const outlineButtonClass = "h-10 border-auth-field px-3.5 !text-[14px] font-semibold text-auth-ink";
const removeButtonClass = "h-10 px-3 !text-[14px] font-semibold text-auth-muted";

function useFilePicker(onPick: (file: File) => void) {
	const inputRef = React.useRef<HTMLInputElement>(null);
	const input = (
		<input
			ref={inputRef}
			type="file"
			accept="image/*"
			hidden
			onChange={(e) => {
				const file = e.target.files?.[0];
				e.target.value = "";
				if (file) onPick(file);
			}}
		/>
	);
	return { input, open: () => inputRef.current?.click() };
}

export function LogoField({ image, currentUrl, onPick, onRemove }: ImageFieldProps) {
	const { input, open } = useFilePicker(onPick);
	const src = image?.preview ?? currentUrl;

	return (
		<div role="group" aria-labelledby="org-logo-label" className="grid gap-1.5">
			<span id="org-logo-label" className={labelClass}>
				Logo{optionalTag}
			</span>
			<div className="flex items-center gap-4">
				<span
					className={classNames(
						"relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border bg-auth-page text-auth-placeholder",
						src ? "border-transparent" : "border-dashed border-auth-field"
					)}
				>
					{src ? (
						<Image src={src} alt="Your logo" fill sizes="64px" className="object-cover" />
					) : (
						<ImageIcon aria-hidden="true" className="size-[22px]" />
					)}
				</span>
				<div className="grid gap-1.5">
					<div className="flex flex-wrap gap-2">
						<AppButton variant="outline" onClick={open} aria-describedby="org-logo-hint" className={outlineButtonClass}>
							{src ? "Replace logo" : "Upload logo"}
						</AppButton>
						{image && (
							<AppButton variant="ghost" onClick={onRemove} aria-label="Remove logo" className={removeButtonClass}>
								Remove
							</AppButton>
						)}
					</div>
					<p id="org-logo-hint" className="text-[13px] leading-[1.45] text-auth-muted">
						A square image works best.
					</p>
				</div>
			</div>
			{input}
		</div>
	);
}

export function CoverField({ image, currentUrl, onPick, onRemove }: ImageFieldProps) {
	const { input, open } = useFilePicker(onPick);
	const src = image?.preview ?? currentUrl;
	const [dragging, setDragging] = React.useState(false);

	const drop = (e: React.DragEvent) => {
		e.preventDefault();
		setDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) onPick(file);
	};

	return (
		<div role="group" aria-labelledby="org-cover-label" className="grid gap-1.5">
			<span id="org-cover-label" className={labelClass}>
				Cover image{optionalTag}
			</span>
			{src ? (
				<>
					<div className="relative aspect-[3/1] overflow-hidden rounded-[10px] bg-auth-info-soft">
						<Image src={src} alt="Your cover image" fill sizes="560px" className="object-cover" />
					</div>
					<div className="mt-1 flex flex-wrap gap-2">
						<AppButton variant="outline" onClick={open} className={outlineButtonClass}>
							Replace cover
						</AppButton>
						{image && (
							<AppButton variant="ghost" onClick={onRemove} aria-label="Remove cover image" className={removeButtonClass}>
								Remove
							</AppButton>
						)}
					</div>
				</>
			) : (
				<>
					<button
						type="button"
						onClick={open}
						onDragOver={(e) => {
							e.preventDefault();
							setDragging(true);
						}}
						onDragLeave={() => setDragging(false)}
						onDrop={drop}
						aria-label="Choose a cover image"
						aria-describedby="org-cover-hint"
						className={classNames(
							"grid aspect-[3/1] w-full place-content-center justify-items-center gap-2 rounded-[10px] border border-dashed px-6 text-center transition-colors duration-150 disabled:cursor-not-allowed",
							dragging ? "border-auth-link bg-auth-info-soft" : "border-auth-field bg-auth-page hover:border-auth-field-hover"
						)}
					>
						<ImageUp aria-hidden="true" className="size-6 text-auth-placeholder" />
						<span className="text-[14px] font-medium text-auth-ink">
							<span className="font-semibold text-auth-link lg:hidden">Choose a cover image</span>
							<span className="hidden lg:inline">
								Drag an image here, or{" "}
								<span className="font-semibold text-auth-link underline underline-offset-[3px]">browse</span>
							</span>
						</span>
					</button>
					<p id="org-cover-hint" className="text-[13px] leading-[1.45] text-auth-muted">
						Wide image, 1200 × 400 px. A photo from one of your past events works well.
					</p>
				</>
			)}
			{input}
		</div>
	);
}
