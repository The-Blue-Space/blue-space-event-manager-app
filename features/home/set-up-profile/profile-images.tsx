import { Camera, X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { cn } from "@/lib/utils";

type ProfileImagesProps = {
	displayImage: string | null;
	logo: string | null;
	onDisplayImageChange: (file: File) => void;
	onLogoChange: (file: File) => void;
	onDisplayImageRemove: () => void;
	onLogoRemove: () => void;
	disabled?: boolean;
};

export default function ProfileImages({
	displayImage,
	logo,
	onDisplayImageChange,
	onLogoChange,
	onDisplayImageRemove,
	onLogoRemove,
	disabled = false,
}: ProfileImagesProps) {
	const displayImageInputRef = React.useRef<HTMLInputElement>(null);
	const logoInputRef = React.useRef<HTMLInputElement>(null);

	const handleDisplayImageClick = () => {
		if (!disabled) {
			displayImageInputRef.current?.click();
		}
	};

	const handleLogoClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!disabled) {
			logoInputRef.current?.click();
		}
	};

	const handleDisplayImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onDisplayImageChange(file);
		}
	};

	const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			onLogoChange(file);
		}
	};

	const handleDisplayImageRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onDisplayImageRemove();
		if (displayImageInputRef.current) {
			displayImageInputRef.current.value = "";
		}
	};

	const handleLogoRemove = (e: React.MouseEvent) => {
		e.stopPropagation();
		onLogoRemove();
		if (logoInputRef.current) {
			logoInputRef.current.value = "";
		}
	};

	return (
		<div className="w-full">
			{/* Hidden file inputs */}
			<input
				ref={displayImageInputRef}
				type="file"
				accept="image/*"
				onChange={handleDisplayImageChange}
				className="hidden"
				disabled={disabled}
			/>
			<input
				ref={logoInputRef}
				type="file"
				accept="image/*"
				onChange={handleLogoChange}
				className="hidden"
				disabled={disabled}
			/>

			{/* Display Image Container (3:1 aspect ratio) */}
			<div
				className={cn(
					"relative w-full rounded-lg overflow-hidden border-2 border-dashed transition-all group",
					displayImage ? "border-neutral-300" : "border-neutral-400",
					!disabled && "cursor-pointer hover:border-primary-500"
				)}
				style={{ aspectRatio: "3/1" }}
				onClick={handleDisplayImageClick}
			>
				{/* Display Image */}
				{displayImage ? (
					<>
						<Image src={displayImage} alt="Display" fill className="object-cover" />
						{/* Display Image Remove Button */}
						{!disabled && (
							<button
								onClick={handleDisplayImageRemove}
								className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all opacity-0 group-hover:opacity-100"
								type="button"
							>
								<X className="w-4 h-4" />
							</button>
						)}
					</>
				) : (
					<div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-100 text-neutral-500">
						<Camera className="w-8 h-8 mb-2" />
						<p className="text-sm font-medium">Click to upload display image</p>
						<p className="text-xs text-neutral-400 mt-1">Recommended: 1200x400px</p>
					</div>
				)}

				{/* Logo Circle (Bottom-Left) */}
				<div
					className={cn(
						"absolute bottom-4 left-4 w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg overflow-hidden transition-all",
						!disabled && "hover:border-primary-500 hover:scale-105"
					)}
					onClick={handleLogoClick}
				>
					{logo ? (
						<>
							<Image src={logo} alt="Logo" fill className="object-cover" />
							{/* Logo Remove Button */}
							{!disabled && (
								<button
									onClick={handleLogoRemove}
									className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/80 rounded-full text-white transition-all opacity-0 hover:opacity-100"
									type="button"
								>
									<X className="w-3 h-3" />
								</button>
							)}
						</>
					) : (
						<div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-200 text-neutral-500">
							<Camera className="w-6 h-6 mb-1" />
							<p className="text-xs font-medium text-center px-2">Logo</p>
						</div>
					)}
				</div>
			</div>

			{/* Helper Text */}
			<div className="mt-2 space-y-1">
				<p className="text-xs text-neutral-600">
					<span className="font-medium">Display Image:</span> Click the main area to upload (3:1
					ratio recommended)
				</p>
				<p className="text-xs text-neutral-600">
					<span className="font-medium">Logo:</span> Click the circle at bottom-left to upload
					(square image recommended)
				</p>
			</div>
		</div>
	);
}
