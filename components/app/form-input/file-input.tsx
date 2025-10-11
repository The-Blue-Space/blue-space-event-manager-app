import React from "react";
import classNames from "classnames";
import upload_icon from "./assets/upload-icon.svg";
import document_icon from "./assets/document-icon.svg";
import Image from "next/image";
import { UploadMeta } from "@/types/global.types";
import { toast } from "sonner";
import blobReader from "@/lib/blob-reader";
import { X } from "lucide-react";
import Link from "next/link";

type InputNativeAttributes = React.ComponentPropsWithRef<"input">;

type Ref = HTMLInputElement;

interface InputProps extends InputNativeAttributes {
	label?: string;
	disabled?: boolean;
	containerStyle?: string;
	maxFileSize?: number;
	invalid?: boolean;
	overrideInvalid?: boolean;
	errorMessage?: string;
	errorStyle?: string;
	trigger?: React.ReactNode;
	updateFile?: (file: File | null, meta: UploadMeta) => void;
	fileLink?: string;
	fileLinkName?: string;
	dashed?: boolean;
	forceReset?: boolean;
}

const FileInput = React.forwardRef<Ref, InputProps>((props: InputProps, ref) => {
	const {
		name,
		label,
		className,
		disabled,
		containerStyle,
		invalid,
		maxFileSize = 2000000,
		overrideInvalid: override_invalid,
		updateFile,
		dashed = true,
		errorMessage,
		fileLink,
		fileLinkName,
		forceReset,
		...rest
	} = props;
	const [fileName, setFileName] = React.useState<string | null>(fileLinkName || null);
	const [isLoading, setIsLoading] = React.useState(false);

	const { isInvalid } = React.useMemo(() => {
		let isInvalid = false;
		const userInput = rest.value?.toString();
		if (override_invalid) {
			isInvalid = true;
		} else if (invalid && !userInput && rest.required) {
			isInvalid = true;
		}
		return { isInvalid };
	}, [invalid, rest.value, rest.required, override_invalid]);

	const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsLoading(true);
		try {
			const file = e.target.files?.[0] || null;
			if (file) {
				if (file.size > maxFileSize) {
					toast.error("File size is too large");
					return;
				}
				const base64 = await blobReader(file);
				const meta: UploadMeta = {
					base64,
					file_name: file.name,
					mime_type: file.type,
					file_size: file.size,
				};
				if (updateFile) {
					updateFile(file, meta);
				}
				setFileName(file.name);
			}
		} catch (error) {
			toast.error("Error uploading file");
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const resetFile = () => {
		setFileName(null);
		if (updateFile) {
			updateFile(null, {
				base64: "",
				file_name: "",
				mime_type: "",
				file_size: 0,
			});
		}
	};

	React.useEffect(() => {
		if (forceReset) {
			resetFile();
		}
	}, [forceReset]);

	const container = classNames("input-container", containerStyle);

	const errorCn = classNames("text-red-500 text-xs", props.errorStyle, {
		hidden: !props.errorMessage,
	});

	const cn = classNames("flex justify-center rounded-lg border p-3", className, {
		invalid: isInvalid || props.errorMessage,
		"border-dashed border-neutral-400": dashed,
	});
	return (
		<React.Fragment>
			<div className={container}>
				{label && (
					<label className="">
						{label} {rest.required ? <span className="text-red-500">*</span> : null}
					</label>
				)}

				<div className={cn}>
					{fileName ? (
						<div className="flex justify-between items-center gap-2 w-full px-3">
							<div className="flex items-center gap-2">
								<Image src={document_icon} alt="document-icon" width={30} height={30} />
								<div className="body-3 flex flex-col">
									<FileLink fileLink={fileLink} fileName={fileName} />
									<span className="text-success-300">Uploaded successfully</span>
								</div>
							</div>

							<button className="text-primary-600 underline" onClick={resetFile}>
								<X className="size-4 text-error-500" />
							</button>
						</div>
					) : (
						<>
							{props.trigger ?? (
								<React.Fragment>
									<label htmlFor={name} className="flex flex-col items-center gap-2 cursor-pointer">
										<div className="flex items-center justify-center rounded-full size-10 bg-neutral-100">
											{/* <FilePlus2 className="size-8 -scale-x-100 -translate-x-px" /> */}
											<Image src={upload_icon} alt="upload-icon" width={40} height={40} />
										</div>
										<span className="text-xs normal-case">
											Click to <span className="underline text-primary-600"> browse</span> files on
											your device{" "}
										</span>

										<div className="text-sm text-neutral-400 !font-light !font-manrope text-center">
											{maxFileSize && (
												<span className="">
													Maximum file size is {(maxFileSize / 1024 / 1024).toFixed(1) + "MB"}
												</span>
											)}{" "}
											-{" "}
											{rest.accept && (
												<span className="">
													{" "}
													{rest.accept.toUpperCase()}
													{/* {capitalize(rest.accept ?? "", "all")} */}
												</span>
											)}
										</div>
									</label>
								</React.Fragment>
							)}
							<input
								ref={ref}
								className="hidden"
								type={"file"}
								id={name}
								name={name}
								disabled={disabled || isLoading}
								onChange={handleChange}
								{...rest}
							/>
						</>
					)}
				</div>
				<small className={errorCn}>{errorMessage}</small>
			</div>
		</React.Fragment>
	);
});

function FileLink({ fileLink, fileName }: { fileLink?: string; fileName: string }) {
	if (!fileLink) {
		return <span className="normal-case break-words break-all line-clamp-1">{fileName}</span>;
	}
	return (
		<Link href={fileLink} target="_blank">
			<span className="normal-case break-words break-all line-clamp-1">{fileName}</span>
		</Link>
	);
}

FileInput.displayName = "FileInput";

export default FileInput;
