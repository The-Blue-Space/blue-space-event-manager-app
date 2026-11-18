import { redirect } from "next/navigation";

// The separate Event Manager is now the event page's Details tab.
export default async function ManageEventRedirect({ params }: { params: Promise<{ event_id: string }> }) {
	const { event_id } = await params;
	redirect(`/events/${event_id}?tab=details`);
}
