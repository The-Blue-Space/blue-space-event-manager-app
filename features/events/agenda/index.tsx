"use client";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import classNames from "classnames";
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AlertCircle, GripVertical, MoreHorizontal, Plus, X } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useEvent } from "@/features/events/manage-event/context";
import { DashboardError } from "@/features/home/dashboard/states";
import { Pill } from "@/features/home/dashboard/ui";
import ensureError from "@/lib/ensure-error";
import { LineupPerson, Session, getProgram, removePerson, reorderLineup } from "@/services/program";
import { Face, PersonSheet, SessionSheet } from "./sheets";
import { describeRun, formatClock, formatDay, lagosDay, timeOptions } from "./time";

const outlineButton =
	"inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover";
const menuItem = "flex h-9 cursor-pointer items-center rounded-lg px-2.5 text-[14px] font-semibold text-auth-ink focus:bg-auth-page data-[disabled]:text-auth-muted";

function RowMenu({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				aria-label={label}
				className="grid size-9 shrink-0 place-items-center rounded-lg text-auth-muted transition-colors hover:bg-auth-page hover:text-auth-ink data-[state=open]:bg-auth-page"
			>
				<MoreHorizontal aria-hidden="true" className="size-[18px]" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="min-w-[200px] rounded-xl border-auth-line bg-white p-1.5 font-manrope shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]">
				{children}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function SessionRow({ session, last, onEdit }: { session: Session; last: boolean; onEdit: () => void }) {
	return (
		<li className="grid grid-cols-[88px_20px_minmax(0,1fr)_auto] gap-x-3 px-4 sm:grid-cols-[96px_20px_minmax(0,1fr)_auto] sm:px-5">
			<div className="pb-6 pt-4">
				<p className="text-[15px] font-bold text-auth-ink">{session.starts_at ? formatClock(session.starts_at) : "No time"}</p>
				{session.ends_at && <p className="text-[13px] text-auth-muted">to {formatClock(session.ends_at)}</p>}
			</div>
			<div aria-hidden="true" className="relative flex justify-center pt-[22px]">
				{!last && <span className="absolute bottom-0 top-[30px] w-px bg-auth-line" />}
				<span className={classNames("relative size-[11px] rounded-full border-2 bg-white", session.outside_event ? "border-auth-error" : "border-primary-500")} />
			</div>
			<div className="grid min-w-0 content-start gap-2 pb-6 pt-4">
				<p className="text-[15px] font-bold text-auth-ink">{session.title}</p>
				{session.description && <p className="text-[14px] text-auth-muted">{session.description}</p>}
				{session.outside_event && (
					<span className="w-fit">
						<Pill tone="error">Ends after the event</Pill>
					</span>
				)}
				{session.hosts.length > 0 && (
					<ul className="flex flex-wrap gap-2">
						{session.hosts.map((host) => (
							<li key={host.lineup_id ?? host.name} className="inline-flex h-8 items-center gap-2 rounded-full border border-auth-line bg-white py-1 pl-1 pr-3 text-[13px] font-semibold text-auth-ink">
								<Face name={host.name} image={host.image_url} size="size-6" text="text-[10px]" />
								{host.name}
							</li>
						))}
					</ul>
				)}
			</div>
			<div className="pt-3">
				<RowMenu label={`More actions for ${session.title}`}>
					<DropdownMenuItem className={menuItem} onSelect={onEdit}>
						Edit
					</DropdownMenuItem>
				</RowMenu>
			</div>
		</li>
	);
}

function PersonRow({ person, index, count, onEdit, onMove, onRemove }: { person: LineupPerson; index: number; count: number; onEdit: () => void; onMove: (by: -1 | 1) => void; onRemove: () => void }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: person.id });
	return (
		<li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={classNames("flex items-start gap-2.5 bg-white px-3 py-3.5", isDragging && "relative z-10 shadow-[0_16px_40px_-16px_rgba(25,24,55,0.45)]")}>
			<button type="button" {...attributes} {...listeners} aria-label={`${person.artist_name}. Drag to change the order`} className="mt-3 grid size-6 cursor-grab place-items-center rounded text-auth-muted hover:text-auth-ink active:cursor-grabbing">
				<GripVertical aria-hidden="true" className="size-4" />
			</button>
			<Face name={person.artist_name} image={person.artist_image_url} size="size-11" text="text-[14px]" />
			<div className="grid min-w-0 flex-1 gap-0.5">
				<div className="flex flex-wrap items-center gap-2">
					<p className="text-[15px] font-bold text-auth-ink">{person.artist_name}</p>
					{person.is_headliner && <Pill tone="neutral">Headliner</Pill>}
				</div>
				{person.notes && <p className="line-clamp-2 text-[13px] text-auth-muted">{person.notes}</p>}
				{person.start_time && (
					<p className="text-[13px] text-auth-muted">
						{toTwelveHour(person.start_time)}
						{person.end_time ? ` to ${toTwelveHour(person.end_time)}` : ""}
					</p>
				)}
			</div>
			<RowMenu label={`More actions for ${person.artist_name}`}>
				<DropdownMenuItem className={menuItem} onSelect={onEdit}>
					Edit
				</DropdownMenuItem>
				<DropdownMenuItem className={menuItem} disabled={index === 0} onSelect={() => onMove(-1)}>
					Move up
				</DropdownMenuItem>
				<DropdownMenuItem className={menuItem} disabled={index === count - 1} onSelect={() => onMove(1)}>
					Move down
				</DropdownMenuItem>
				<DropdownMenuSeparator className="mx-1 my-1.5 bg-auth-line" />
				<DropdownMenuItem className={classNames(menuItem, "text-auth-error focus:text-auth-error")} onSelect={onRemove}>
					Remove from lineup
				</DropdownMenuItem>
			</RowMenu>
		</li>
	);
}

/** "22:30" → "10:30 PM" */
function toTwelveHour(value: string) {
	const [hours, minutes] = value.split(":").map(Number);
	if (Number.isNaN(hours)) return value;
	const suffix = hours >= 12 ? "PM" : "AM";
	return `${hours % 12 || 12}:${String(minutes || 0).padStart(2, "0")} ${suffix}`;
}

export default function AgendaTab({ eventId }: { eventId: string }) {
	const { event } = useEvent();
	const queryClient = useQueryClient();
	const [editingSession, setEditingSession] = React.useState<Session | null | undefined>(undefined);
	const [editingPerson, setEditingPerson] = React.useState<LineupPerson | null | undefined>(undefined);
	const [fromSession, setFromSession] = React.useState(false);
	const [picked, setPicked] = React.useState<string | null>(null);
	const [order, setOrder] = React.useState<string[] | null>(null);
	const [removing, setRemoving] = React.useState<LineupPerson | null>(null);

	const query = useQuery({ queryKey: ["program", eventId], queryFn: () => getProgram(eventId) });
	const refresh = React.useCallback(() => queryClient.invalidateQueries({ queryKey: ["program", eventId] }), [eventId, queryClient]);
	const program = query.data;
	const serverLineup = React.useMemo(() => program?.lineup ?? [], [program]);
	React.useEffect(() => setOrder(null), [serverLineup]);
	const lineup = order ? (order.map((id) => serverLineup.find((person) => person.id === id)).filter(Boolean) as LineupPerson[]) : serverLineup;
	const options = React.useMemo(() => timeOptions(program?.starts_at ?? null, program?.ends_at ?? null), [program?.starts_at, program?.ends_at]);
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

	const saveOrder = async (ids: string[]) => {
		setOrder(ids);
		try {
			await reorderLineup(eventId, ids);
			refresh();
		} catch (error) {
			setOrder(null);
			toast.error(ensureError(error).message || "We couldn’t save the new order.");
		}
	};
	const onDragEnd = ({ active, over }: DragEndEvent) => {
		if (!over || active.id === over.id) return;
		const ids = lineup.map((person) => person.id);
		saveOrder(arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))));
	};

	if (query.isError) return <DashboardError onRetry={() => query.refetch()} isRetrying={query.isFetching} />;
	if (!program) {
		return (
			<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_372px]" aria-hidden="true">
				<Skeleton className="h-80 rounded-[14px]" />
				<Skeleton className="h-64 rounded-[14px]" />
			</div>
		);
	}

	const title = event?.title ?? "This event";
	const noSchedule = !program.starts_at;
	const nothingYet = !program.sessions.length && !lineup.length;
	const outside = program.sessions.filter((session) => session.outside_event);

	// Group sessions by their Lagos day, so an overnight event shows a second day heading.
	const days: { day: string; sessions: Session[] }[] = [];
	for (const session of program.sessions) {
		const day = session.starts_at ? lagosDay(session.starts_at) : "none";
		const last = days.at(-1);
		if (last && last.day === day) last.sessions.push(session);
		else days.push({ day, sessions: [session] });
	}
	const dayRange = (index: number) => {
		if (!program.starts_at) return "";
		const overnight = program.ends_at && lagosDay(program.starts_at) !== lagosDay(program.ends_at);
		if (!overnight) return program.ends_at ? `${formatClock(program.starts_at)} to ${formatClock(program.ends_at)}` : `From ${formatClock(program.starts_at)}`;
		if (index === 0) return `From ${formatClock(program.starts_at)}`;
		return program.ends_at ? `Until ${formatClock(program.ends_at)}` : "";
	};

	const openSession = (session: Session | null) => {
		setPicked(null);
		setEditingSession(session);
	};
	const sessionOpen = editingSession !== undefined;

	return (
		<div className="grid min-w-0 gap-6">
			{nothingYet && <p className="text-[14px] text-auth-muted">Both are optional. You can publish without them and add them later.</p>}

			<div className="grid min-w-0 items-start gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_372px]">
				<section aria-labelledby="agenda-title" className="grid min-w-0 gap-4">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="grid gap-1">
							<h2 id="agenda-title" className="text-[18px] font-bold text-auth-ink">
								Agenda {nothingYet && <span className="font-medium text-auth-muted">(optional)</span>}
							</h2>
							<p className="text-[14px] text-auth-muted">What happens when. Guests see it on the event page.</p>
						</div>
						{program.sessions.length > 0 && (
							<button type="button" onClick={() => openSession(null)} className={outlineButton}>
								<Plus aria-hidden="true" className="size-4" />
								Add session
							</button>
						)}
					</div>

					{outside.length > 0 && (
						<p role="alert" className="flex items-start gap-2.5 rounded-xl border border-auth-error-line bg-auth-error-soft px-4 py-3 text-[14px] text-auth-error-ink">
							<AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-auth-error" />
							{outside.length === 1
								? `${outside[0].title} falls outside the event’s hours. ${describeRun(title, program.starts_at, program.ends_at)} Change the session, or when the event runs in Details.`
								: `${outside.length} sessions fall outside the event’s hours. ${describeRun(title, program.starts_at, program.ends_at)} Change them, or when the event runs in Details.`}
						</p>
					)}

					{program.sessions.length ? (
						<div className="overflow-hidden rounded-[14px] border border-auth-line bg-white">
							{days.map((group, index) => (
								<div key={group.day} className={classNames(index > 0 && "border-t border-auth-line")}>
									<div className="flex items-center justify-between gap-3 border-b border-auth-line bg-auth-page px-5 py-3 text-[13px]">
										<span className="font-bold text-auth-ink">{group.sessions[0].starts_at ? formatDay(group.sessions[0].starts_at) : "No time yet"}</span>
										<span className="text-auth-muted">{dayRange(index)}</span>
									</div>
									<ol>
										{group.sessions.map((session, i) => (
											<SessionRow key={session.id} session={session} last={i === group.sessions.length - 1} onEdit={() => openSession(session)} />
										))}
									</ol>
								</div>
							))}
						</div>
					) : (
						<div className="grid justify-items-start gap-2 rounded-[14px] border border-dashed border-auth-field bg-auth-page p-6">
							<p className="text-[16px] font-bold text-auth-ink">No sessions yet</p>
							<p className="max-w-[56ch] text-[14px] text-auth-muted">
								{noSchedule
									? "Add what happens when, like doors, the sets and last orders. Set the event’s date and time in Details first."
									: `Add what happens when, like doors, the sets and last orders. ${describeRun(title, program.starts_at, program.ends_at)}`}
							</p>
							<button
								type="button"
								onClick={() => openSession(null)}
								disabled={noSchedule}
								className="mt-2 inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-[#8E8DB0]"
							>
								<Plus aria-hidden="true" className="size-4" />
								Add a session
							</button>
						</div>
					)}
				</section>

				<section aria-labelledby="lineup-title" className="grid min-w-0 gap-4">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="grid gap-1">
							<h2 id="lineup-title" className="text-[18px] font-bold text-auth-ink">
								Lineup {nothingYet && <span className="font-medium text-auth-muted">(optional)</span>}
							</h2>
							<p className="text-[14px] text-auth-muted">Who’s on, in the order guests see them.</p>
						</div>
						{lineup.length > 0 && (
							<button type="button" onClick={() => setEditingPerson(null)} className={outlineButton}>
								<Plus aria-hidden="true" className="size-4" />
								Add person
							</button>
						)}
					</div>
					{lineup.length ? (
						<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
							<SortableContext items={lineup.map((person) => person.id)} strategy={verticalListSortingStrategy}>
								<ul className="divide-y divide-auth-line overflow-hidden rounded-[14px] border border-auth-line">
									{lineup.map((person, index) => (
										<PersonRow
											key={person.id}
											person={person}
											index={index}
											count={lineup.length}
											onEdit={() => setEditingPerson(person)}
											onMove={(by) => {
												const ids = lineup.map((item) => item.id);
												saveOrder(arrayMove(ids, index, index + by));
											}}
											onRemove={() => setRemoving(person)}
										/>
									))}
								</ul>
							</SortableContext>
						</DndContext>
					) : (
						<div className="grid justify-items-start gap-2 rounded-[14px] border border-dashed border-auth-field bg-auth-page p-6">
							<p className="text-[16px] font-bold text-auth-ink">No one in the lineup yet</p>
							<p className="text-[14px] text-auth-muted">Add the DJs, artists, speakers or hosts, with a photo and a line about each.</p>
							<button type="button" onClick={() => setEditingPerson(null)} className={classNames(outlineButton, "mt-2")}>
								<Plus aria-hidden="true" className="size-4" />
								Add a person
							</button>
						</div>
					)}
				</section>
			</div>

			<SessionSheet
				open={sessionOpen}
				onClose={() => setEditingSession(undefined)}
				session={editingSession ?? null}
				lineup={lineup}
				pickedPerson={picked}
				onNewPerson={() => {
					setFromSession(true);
					setEditingPerson(null);
				}}
				eventId={eventId}
				eventTitle={title}
				startsAt={program.starts_at}
				endsAt={program.ends_at}
				options={options}
				onSaved={refresh}
			/>
			<PersonSheet
				open={editingPerson !== undefined}
				onClose={() => {
					setEditingPerson(undefined);
					setFromSession(false);
				}}
				person={editingPerson ?? null}
				onCreated={(person) => fromSession && setPicked(person.id)}
				eventId={eventId}
				eventTitle={title}
				startsAt={program.starts_at}
				endsAt={program.ends_at}
				options={options}
				onSaved={refresh}
			/>
			<ConfirmDialog
				open={Boolean(removing)}
				onOpenChange={(open) => !open && setRemoving(null)}
				title={`Remove ${removing?.artist_name ?? "them"} from the lineup?`}
				text="They come off the lineup and any session they’re on."
				confirmLabel="Remove"
				icon={<X />}
				onConfirm={async () => {
					if (!removing) return;
					await removePerson(removing.id);
					toast.success("Removed from the lineup.");
					refresh();
				}}
			/>
		</div>
	);
}
