"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AppButton from "@/components/app/app-button";
import { HelpCircle, ChevronDown, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEvent } from "../../../context";
import { EventFaq } from "@/types/event.types";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Textarea } from "@/components/app/form-input";

export default function FaqSection() {
	const { event, updateEvent } = useEvent();
	const [faqs, setFaqs] = useState<EventFaq[]>([]);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [showActions, setShowActions] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const parsedFaqs = useMemo(() => {
		if (!event?.faq) return [];
		try {
			const eventFaq = event.faq;
			const parsed = typeof eventFaq === "string" ? JSON.parse(eventFaq) : eventFaq;
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}, [event?.faq]);

	// Parse FAQ from event
	useEffect(() => {
		setFaqs(parsedFaqs);
	}, [parsedFaqs]);

	const handleAddFaq = () => {
		const newFaq = { question: "", answer: "" };
		setFaqs([...faqs, newFaq]);
		setEditingIndex(faqs.length);
		setShowActions(true);
		setIsEditing(false);

	};

	const handleSaveFaq = async () => {
		// if (!faqs.length) {
		// 	toast.error("Please add at least one question");
		// 	return;
		// }

		const hasIncompleteFaq = faqs.some((faq) => !faq.question.trim() || !faq.answer.trim());

		if (hasIncompleteFaq) {
			toast.error("Please fill out all questions and answers");
			return;
		}

		setIsLoading(true);
		try {
			// Stringify FAQ array
			const faqString = JSON.stringify(faqs);

			await updateEvent("server", { faq: faqString as any });
			setEditingIndex(null);
			toast.success("FAQs updated successfully");
			setShowActions(false);
			setIsEditing(false);
		} catch (error) {
			toast.error("Failed to update FAQ");
			console.error(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleDeleteFaq = (index: number) => {
		if (!showActions) {
			setShowActions(true)
		}
		setFaqs((prev) => prev.filter((_, i) => i !== index));
		if (editingIndex === index) {
			setEditingIndex(null);
		} else if (editingIndex !== null && index < editingIndex) {
			setEditingIndex((prev) => (prev !== null ? prev - 1 : prev));
		}
	};

	const handleUpdateFaq = (index: number, field: "question" | "answer", value: string) => {
		if (!showActions) {
		setShowActions(true);
			
		}
		const newFaqs = [...faqs];
		newFaqs[index][field] = value;
		setFaqs(newFaqs);
	};

	const handleCancelEdit = (index: number) => {
		// If it's a new FAQ (empty), remove it
		const faq = faqs[index];
		if (!faq.question && !faq.answer) {
			const newFaqs = faqs.filter((_, i) => i !== index);
			setFaqs(newFaqs);
		}
		setEditingIndex(null);
		setShowActions(false);
		setIsEditing(false);
	};

	const handleCancelChanges = () => {
		setFaqs(parsedFaqs);
		setEditingIndex(null);
		setShowActions(false);
		setIsEditing(false);

	};

	const handleEdit = (index: number) => {
		setEditingIndex(index);
		setIsEditing(true);
	};

	return (
		<div className="border border-neutral-200 rounded-lg p-5 bg-white">
			<div className="mb-4 pb-3 border-b border-neutral-100">
				<h3 className="flex items-center gap-2 text-neutral-800 mb-2">
					<HelpCircle className="w-5 h-5 text-primary-500" />
					<span className="body-2 font-semibold">Frequently asked questions</span>
				</h3>
				<p className="text-sm text-neutral-600">
					Answer questions your attendees may have about the event, like accessibility and
					amenities.
				</p>
			</div>

			{/* FAQ List - Stacked */}
			<div className="space-y-3">
				{faqs.map((faq, index) => (
					<div key={index} className="border border-neutral-200 rounded-lg overflow-hidden">
						{editingIndex === index ? (
							// Edit Mode
							<div className="p-4 space-y-4 bg-neutral-50">
								<div>
									<Label>
										Question <span className="text-red-500">*</span>
									</Label>
									<Input
										value={faq.question}
										onChange={(e) =>
											handleUpdateFaq(index, "question", e.target.value.slice(0, 30))
										}
										placeholder="Question"
										maxLength={30}
										disabled={isLoading}
									/>
									<p className="text-xs text-neutral-500 mt-1">{faq.question.length}/30</p>
								</div>

								<div>
									<Label>
										Answer <span className="text-red-500">*</span>
									</Label>
									<Textarea
										value={faq.answer}
										onChange={(e) => handleUpdateFaq(index, "answer", e.target.value.slice(0, 100))}
										placeholder="Answer"
										maxLength={100}
										disabled={isLoading}
										rows={3}
									/>
									<p className="text-xs text-neutral-500 mt-1">{faq.answer.length}/100</p>
								</div>

								<div className="flex gap-2 justify-end">
									<AppButton
										variant="ghost"
										onClick={() => handleDeleteFaq(index)}
										disabled={isLoading}
										leftIcon={<Trash2 className="w-4 h-4" />}
									>
										Delete
									</AppButton>
									{isEditing && (
										<AppButton
											variant="outline"
											onClick={() => handleCancelEdit(index)}
											disabled={isLoading}
										>
											Cancel
										</AppButton>
									)}
								</div>
							</div>
						) : (
							// View Mode - Collapsible
							<Collapsible>
								<CollapsibleTrigger
									className="flex justify-between items-center w-full p-4 hover:bg-neutral-50 transition-colors"
									onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
										// Allow edit on double-click
										if (e.detail === 2) {
											handleEdit(index);
										}
									}}
								>
									<span className="font-medium text-left body-2">{faq.question}</span>
									<div className="flex items-center gap-2">
										<AppButton
											variant="ghost"
											onClick={(e) => {
												e.stopPropagation();
												handleEdit(index);
											}}
											className="text-xs"
										>
											Edit
										</AppButton>
										<ChevronDown className="w-4 h-4 text-neutral-500" />
									</div>
								</CollapsibleTrigger>
								<CollapsibleContent className="px-4 pb-4">
									<p className="text-sm text-neutral-600 mt-2 bg-neutral-50 p-3 rounded">
										{faq.answer}
									</p>
								</CollapsibleContent>
							</Collapsible>
						)}
					</div>
				))}
			</div>

			{/* Action Buttons */}
			<div className="flex justify-between gap-3 mt-4">
				<AppButton
					variant="ghost"
					onClick={handleAddFaq}
					className="text-primary-500 text-sm hover:underline"
					disabled={isLoading}
				>
					+ Add question
				</AppButton>
				{showActions && (
					<div className="space-x-3">
						<AppButton variant="outline" onClick={handleCancelChanges} disabled={isLoading}>
							Cancel
						</AppButton>
						<AppButton variant="primary" onClick={handleSaveFaq} isLoading={isLoading}>
							Save
						</AppButton>
					</div>
				)}
			</div>
		</div>
	);
}
