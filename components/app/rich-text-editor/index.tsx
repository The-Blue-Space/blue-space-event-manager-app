"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import Toolbar from "./toolbar";
import "./styles.css";
import { cn } from "@/lib/utils";

type RichTextEditorProps = {
	content: string;
	onChange: (content: string) => void;
	editable?: boolean;
	placeholder?: string;
	className?: string;
};

export default function RichTextEditor({
	content,
	onChange,
	editable = true,
	placeholder = "Start typing...",
	className,
}: RichTextEditorProps) {
	const editor = useEditor({
		extensions: [
			StarterKit,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-blue-500 underline cursor-pointer",
				},
			}),
		],
		content,
		editable,
		immediatelyRender: false, // Fix SSR hydration issues
		onUpdate: ({ editor }) => {
			onChange(editor.getHTML());
		},
		editorProps: {
			attributes: {
				class: "prose prose-sm max-w-none focus:outline-none",
			},
		},
	});

	// Update content when prop changes
	useEffect(() => {
		if (editor && content !== editor.getHTML()) {
			editor.commands.setContent(content);
		}
	}, [content, editor]);

	// Update editable state
	useEffect(() => {
		if (editor) {
			editor.setEditable(editable);
		}
	}, [editable, editor]);

	if (!editor) {
		return null;
	}

	return (
		<div className={cn("border border-neutral-200 rounded-lg overflow-hidden bg-white", className)}>
			{editable && <Toolbar editor={editor} />}
			<EditorContent editor={editor} placeholder={placeholder} />
		</div>
	);
}
