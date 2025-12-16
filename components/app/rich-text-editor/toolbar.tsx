import { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToolbarProps = {
	editor: Editor;
};

export default function Toolbar({ editor }: ToolbarProps) {
	const ToolbarButton = ({
		onClick,
		active,
		children,
	}: {
		onClick: () => void;
		active: boolean;
		children: React.ReactNode;
	}) => (
		<button
			type="button"
			onClick={onClick}
			className={cn(
				"p-2 rounded hover:bg-neutral-100 transition-colors",
				active && "bg-neutral-200 text-primary-500"
			)}
		>
			{children}
		</button>
	);

	return (
		<div className="flex items-center gap-1 border-b border-neutral-200 p-2 bg-neutral-50">
			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBold().run()}
				active={editor.isActive("bold")}
			>
				<Bold className="w-4 h-4" />
			</ToolbarButton>

			<ToolbarButton
				onClick={() => editor.chain().focus().toggleItalic().run()}
				active={editor.isActive("italic")}
			>
				<Italic className="w-4 h-4" />
			</ToolbarButton>

			<div className="w-px h-6 bg-neutral-300 mx-1" />

			<ToolbarButton
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				active={editor.isActive("bulletList")}
			>
				<List className="w-4 h-4" />
			</ToolbarButton>

			<ToolbarButton
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				active={editor.isActive("orderedList")}
			>
				<ListOrdered className="w-4 h-4" />
			</ToolbarButton>

			<div className="w-px h-6 bg-neutral-300 mx-1" />

			<ToolbarButton
				onClick={() => {
					const url = window.prompt("Enter URL:");
					if (url) {
						editor.chain().focus().setLink({ href: url }).run();
					}
				}}
				active={editor.isActive("link")}
			>
				<Link2 className="w-4 h-4" />
			</ToolbarButton>
		</div>
	);
}
