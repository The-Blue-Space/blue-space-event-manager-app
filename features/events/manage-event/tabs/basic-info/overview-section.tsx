"use client";

import { useState, useEffect, useMemo } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { useEvent } from "../../context";
import SectionWrapper from "../../section-wrapper";
import RichTextEditor from "@/components/app/rich-text-editor";

export default function OverviewSection() {
	const { event, updateEvent } = useEvent();
	const [isLoading, setIsLoading] = useState(false);

	// Generate default overview text from event data
	const generateDefaultOverview = useMemo(() => {
		if (!event) return "";

		const title = event.title || "Your Event";
		const date = event.event_start_date
			? new Date(event.event_start_date).toLocaleDateString("en-US", {
					weekday: "long",
					year: "numeric",
					month: "long",
					day: "numeric",
			  })
			: "[Insert Date]";
		const time = event.event_start_time
			? new Date(`2000-01-01T${event.event_start_time}`).toLocaleTimeString("en-US", {
					hour: "numeric",
					minute: "2-digit",
					hour12: true,
			  })
			: "";
		const location =
			[event.venue_name, event.city, event.state].filter(Boolean).join(", ") || "[Insert Location]";
		const description = event.description || "";

		return `<p><strong>Welcome to ${title}!</strong></p><p><strong>Date:</strong> ${date}${
			time ? ` at ${time}` : ""
		}</p><p><strong>Location:</strong> ${location}</p><p>${description}</p><p>Join us for an exciting event filled with engaging activities and networking opportunities. Whether you're a first-time attendee or a returning guest, this event is perfect for anyone looking to connect and learn. Don't miss out on this chance to be part of something special!</p>`;
	}, [event]);

	// Initialize content from event or generate default
	const initialContent = useMemo(() => {
		return event?.overview || generateDefaultOverview;
	}, [event?.overview, generateDefaultOverview]);

	const [content, setContent] = useState(initialContent);

	// Sync content when event overview changes
	useEffect(() => {
		if (event?.overview) {
			setContent(event.overview);
		} else if (!content) {
			setContent(generateDefaultOverview);
		}
	}, [event?.overview, generateDefaultOverview, content]);

	const handleSave = async () => {
		setIsLoading(true);
		try {
			await updateEvent("server", { overview: content });
			toast.success("Overview updated successfully");
		} catch (error) {
			toast.error("Failed to update overview");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCancel = () => {
		setContent(initialContent);
	};

	return (
		<SectionWrapper
			title="Overview"
			icon={<FileText className="w-5 h-5 text-primary-500" />}
			onSave={handleSave}
			onCancel={handleCancel}
			isLoading={isLoading}
		>
			{(mode) =>
				mode === "view" ? (
					<div
						className="prose prose-sm max-w-none"
						dangerouslySetInnerHTML={{ __html: content || generateDefaultOverview }}
					/>
				) : (
					<>
						<p className="text-sm text-neutral-600 mb-3">
							Add more details about your event and include what people can expect if they attend.
						</p>
						<RichTextEditor content={content} onChange={setContent} editable={true} />
						<p className="text-xs text-neutral-500 mt-2">
							Use arrow keys to navigate between modules. Use the up and down buttons to reorder
							modules.
						</p>
					</>
				)
			}
		</SectionWrapper>
	);
}
