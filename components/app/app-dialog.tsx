import classNames from "classnames";
import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "../ui/dialog";

type Props = {
	children: React.ReactNode;
	open: boolean;
	onClose: (state: boolean) => void;
	title?: string;
	description?: string;
	footer?: React.ReactNode;
	containerClassName?: string;
	headerContainerClassName?: string;
	footerContainerClassName?: string;
	descriptionClassName?: string;
	titleClassName?: string;
	showCloseButton?: boolean;
};

export default function AppDialog(props: Props) {
	const {
		children,
		title = "",
		description = "",
		open,
		onClose,
		footer,
		containerClassName,
		headerContainerClassName,
		footerContainerClassName,
		descriptionClassName,
		titleClassName,
		showCloseButton = true,
	} = props;

	const containerClx = classNames("max-h-[90%] overflow-y-auto", containerClassName);
	const headerContainerClx = classNames("", headerContainerClassName);
	const footerContainerClx = classNames("", footerContainerClassName);
	const descriptionClx = classNames("", descriptionClassName);
	const titleClx = classNames("", titleClassName);

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className={containerClx} showCloseButton={showCloseButton}>
				{title ? (
					<DialogHeader className={headerContainerClx}>
						<DialogTitle className={titleClx}>{title}</DialogTitle>
						{description && (
							<DialogDescription className={descriptionClx}>{description}</DialogDescription>
						)}
					</DialogHeader>
				) : (
					<React.Fragment>
						<DialogTitle />
						<DialogDescription />
					</React.Fragment>
				)}

				{children}
				{footer && <DialogFooter className={footerContainerClx}>{footer}</DialogFooter>}
			</DialogContent>
		</Dialog>
	);
}
