"use client";
import * as React from "react";
import classNames from "classnames";
import { AlertCircle, Mail, X } from "lucide-react";
import { toast } from "sonner";
import { controlClass } from "@/components/app/field";
import { Sheet } from "@/features/events/manage-event/tabs/tickets/ui";
import ensureError from "@/lib/ensure-error";
import { findPerson, invitePeople } from "@/services/guests";
import useAppSelector from "@/store/hooks";
import { EventAccessType } from "@/types/event-summary.types";
import { Invitee } from "@/types/guests.types";
import { Avatar } from "./ui";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type InviteSheetProps = {
	open: boolean;
	onClose: () => void;
	eventId: string;
	eventTitle: string;
	accessType: EventAccessType;
	onInvited: () => void;
};

type Picked = Invitee & { problem?: string };

/** Add people by email or username, see what each gets, and send every invite at once. */
export default function InviteSheet({ open, onClose, eventId, eventTitle, accessType, onInvited }: InviteSheetProps) {
	const { managerProfile } = useAppSelector("manager_profile");
	const { account } = useAppSelector("account");
	const organizer = managerProfile?.name ?? "you";
	const [value, setValue] = React.useState("");
	const [error, setError] = React.useState("");
	const [finding, setFinding] = React.useState(false);
	const [people, setPeople] = React.useState<Picked[]>([]);
	const [sending, setSending] = React.useState(false);
	const [tried, setTried] = React.useState(false);

	React.useEffect(() => {
		if (!open) return;
		setValue("");
		setError("");
		setPeople([]);
		setTried(false);
	}, [open]);

	const add = async () => {
		const entry = value.trim();
		if (!entry || entry.replace(/^@+/, "").trim() === "") {
			setError("Enter an email or a username.");
			return;
		}
		const isEmail = entry.includes("@") && !entry.startsWith("@");
		if (isEmail && !EMAIL.test(entry)) {
			setError("Enter a full email, like name@example.com.");
			return;
		}
		setFinding(true);
		setError("");
		try {
			const found = await findPerson(entry);
			if (found && account?.id && found.id === account.id) {
				setError("That’s you. You’re running this event, so you don’t need an invite.");
				return;
			}
			const email = entry.toLowerCase();
			const person: Invitee | null = found ?? (isEmail ? { id: `new:${email}`, name: email, email, isNew: true } : null);
			if (!person) {
				setError(`No one uses the username @${entry.replace(/^@/, "")}. Check the spelling, or add them by email instead.`);
				return;
			}
			if (people.some((picked) => picked.id === person.id || (person.email && picked.email === person.email))) {
				setError(`${person.name} is already on your list.`);
				return;
			}
			setPeople((current) => [...current, person]);
			setValue("");
		} catch (failure) {
			setError(ensureError(failure).message || "We couldn’t look that up. Try again.");
		} finally {
			setFinding(false);
		}
	};

	const send = async () => {
		setTried(true);
		if (!people.length) return;
		setSending(true);
		try {
			const results = await invitePeople(eventId, people.map((person) => (person.isNew && person.email ? { email: person.email } : { id: person.id })));
			// One result per person, in the order sent
			const failed = new Map(results.flatMap((result, index) => (result.error && people[index] ? [[people[index].id, result.error] as const] : [])));
			const sent = people.length - failed.size;
			if (sent > 0) {
				toast.success(sent === 1 ? "Invite sent. We emailed them." : `${sent} invites sent. We emailed each of them.`);
				onInvited();
			}
			if (failed.size === 0) {
				onClose();
				return;
			}
			setPeople((current) =>
				current.filter((person) => failed.has(person.id)).map((person) => ({ ...person, problem: describeFailure(failed.get(person.id) ?? "") }))
			);
		} catch (failure) {
			toast.error(ensureError(failure).message || "We couldn’t send the invites. Try again.");
		} finally {
			setSending(false);
		}
	};

	const whatTheyGet =
		accessType === "individual"
			? `Each person gets an email from ${organizer} with the event details and their own code to get in. The code is in their Blue Space app too.`
			: `Each person gets an email from ${organizer} with the event details.`;
	const anyoneNew = people.some((person) => person.isNew);

	return (
		<Sheet
			open={open}
			onClose={onClose}
			title="Invite guests"
			subtitle={eventTitle}
			submitLabel={people.length > 1 ? `Send ${people.length} invites` : "Send invite"}
			footNote={tried && !people.length ? "Add someone to invite first." : ""}
			isSaving={sending}
			onSubmit={send}
		>
			<div className="grid gap-1.5">
				<label htmlFor="invite-person" className="text-[13px] font-semibold">
					Email or username
				</label>
				<div className="flex gap-2">
					<input
						id="invite-person"
						value={value}
						onChange={(e) => {
							setValue(e.target.value);
							if (error) setError("");
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								add();
							}
						}}
						placeholder="name@example.com or @username"
						autoComplete="off"
						aria-invalid={Boolean(error)}
						aria-describedby={error ? "invite-person-error" : undefined}
						className={controlClass(Boolean(error), "h-11 flex-1")}
					/>
					<button
						type="button"
						onClick={add}
						disabled={finding}
						aria-busy={finding}
						className="h-11 shrink-0 rounded-lg border border-auth-field bg-white px-4 text-[14px] font-semibold text-auth-ink hover:border-auth-field-hover disabled:opacity-60"
					>
						{finding ? "Finding…" : "Add"}
					</button>
				</div>
				{error && (
					<p id="invite-person-error" className="flex items-start gap-1.5 text-[13px] font-medium leading-snug text-auth-error">
						<AlertCircle aria-hidden="true" className="mt-px size-4 shrink-0" />
						{error}
					</p>
				)}
			</div>

			{people.length > 0 && (
				<section aria-labelledby="inviting" className="grid gap-2">
					<h3 id="inviting" className="text-[13px] font-semibold">
						Inviting {people.length === 1 ? "1 person" : `${people.length} people`}
					</h3>
					<ul className="divide-y divide-auth-info-soft border-y border-auth-info-soft">
						{people.map((person) => (
							<li key={person.id} className="flex items-center gap-3 py-2.5">
								<Avatar name={person.name} />
								<span className="grid min-w-0 flex-1">
									<span className="truncate text-[14px] font-bold">{person.name}</span>
									<span className={classNames("truncate text-[13px]", person.problem ? "text-auth-error" : "text-auth-muted")}>
										{person.problem ?? (person.isNew ? "New to Blue Space" : person.username ? `@${person.username}` : person.email)}
									</span>
								</span>
								<button
									type="button"
									aria-label={`Remove ${person.name}`}
									onClick={() => setPeople((current) => current.filter((picked) => picked.id !== person.id))}
									className="grid size-8 place-items-center rounded-md text-auth-muted hover:bg-auth-page hover:text-auth-ink"
								>
									<X aria-hidden="true" className="size-4" />
								</button>
							</li>
						))}
					</ul>
				</section>
			)}

			<p className="flex items-start gap-3 rounded-xl bg-auth-page p-4 text-[13px] leading-normal text-auth-muted">
				<Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-primary-500" />
				<span>
					{whatTheyGet}
					{anyoneNew && " People new to Blue Space are asked to get the app and sign up with that email. Your event is waiting for them there."}
				</span>
			</p>
		</Sheet>
	);
}

function describeFailure(error: string) {
	const lower = error.toLowerCase();
	if (lower.includes("already joined")) return "Already a guest.";
	if (lower.includes("already invited") || lower.includes("already been invited")) return "Already invited.";
	if (lower.includes("capacity")) return "The event is full.";
	if (lower.includes("deleted")) return "This email belonged to a deleted Blue Space account.";
	return "We couldn’t invite them. Try again.";
}
