"use client";
import * as React from "react";
import classNames from "classnames";
import { Check, Plus, Upload, User, X } from "lucide-react";
import { toast } from "sonner";
import ConfirmDialog from "@/components/app/confirm-dialog";
import { controlClass } from "@/components/app/field";
import SelectField from "@/components/app/select-field";
import { Sheet, Toggle } from "@/features/events/manage-event/tabs/tickets/ui";
import ensureError from "@/lib/ensure-error";
import { LineupPerson, Session, deleteSession, removePerson, savePerson, saveSession } from "@/services/program";
import { TimeOption, describeLength, describeRun, optionForHHMM, toHHMM } from "./time";

const fieldLabel = "text-[13px] font-semibold text-auth-ink";
const NONE = "none";

export function Initials({ name, size = "size-9", text = "text-[12px]" }: { name: string; size?: string; text?: string }) {
	const letters =
		name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase())
			.join("") || "?";
	return (
		<span aria-hidden="true" className={classNames("grid shrink-0 place-items-center rounded-full bg-auth-info-soft font-bold text-primary-500", size, text)}>
			{letters}
		</span>
	);
}

export function Face({ name, image, size = "size-9", text }: { name: string; image: string | null; size?: string; text?: string }) {
	if (!image) return <Initials name={name} size={size} text={text} />;
	// eslint-disable-next-line @next/next/no-img-element
	return <img src={image} alt="" className={classNames("shrink-0 rounded-full object-cover", size)} />;
}

function ErrorText({ id, children }: { id: string; children: React.ReactNode }) {
	return (
		<p id={id} className="text-[13px] font-medium text-auth-error">
			{children}
		</p>
	);
}

type Common = { open: boolean; onClose: () => void; eventId: string; eventTitle: string; startsAt: string | null; endsAt: string | null; options: TimeOption[]; onSaved: () => void };

/** Adds or changes a session: name, start, end, description and who's on (picked from the lineup). */
export function SessionSheet({
	session,
	lineup,
	onNewPerson,
	pickedPerson,
	...common
}: Common & { session: Session | null; lineup: LineupPerson[]; onNewPerson: () => void; pickedPerson: string | null }) {
	const { open, onClose, eventId, eventTitle, startsAt, endsAt, options, onSaved } = common;
	const [title, setTitle] = React.useState("");
	const [start, setStart] = React.useState("");
	const [end, setEnd] = React.useState("");
	const [description, setDescription] = React.useState("");
	const [who, setWho] = React.useState<string[]>([]);
	const [tried, setTried] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [confirmDelete, setConfirmDelete] = React.useState(false);
	const [serverError, setServerError] = React.useState("");

	React.useEffect(() => {
		if (!open) return;
		setTitle(session?.title ?? "");
		setStart(session?.starts_at ? options.find((o) => o.value === new Date(session.starts_at!).toISOString())?.value ?? new Date(session.starts_at).toISOString() : "");
		setEnd(session?.ends_at ? options.find((o) => o.value === new Date(session.ends_at!).toISOString())?.value ?? new Date(session.ends_at).toISOString() : "");
		setDescription(session?.description ?? "");
		setWho(session?.hosts.map((host) => host.lineup_id).filter(Boolean) as string[] ?? []);
		setTried(false);
		setServerError("");
		// Fill the form when it opens.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, session?.id]);

	// Someone just added from this panel goes straight onto the session.
	React.useEffect(() => {
		if (pickedPerson) setWho((current) => (current.includes(pickedPerson) ? current : [...current, pickedPerson]));
	}, [pickedPerson]);

	const startOptions = options.filter((option) => option.value !== options.at(-1)?.value);
	const endOptions = options.filter((option) => !start || option.value > start);
	// A session saved before the event's hours changed can sit outside them; keep its times choosable so it can be fixed.
	const withCurrent = (list: TimeOption[], value: string) =>
		value && !list.some((option) => option.value === value) ? [{ value, label: `${new Date(value).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Lagos" })} (outside the event)` }, ...list] : list;

	const outsideEvent = (value: string) => Boolean(value) && ((startsAt && value < new Date(startsAt).toISOString()) || (endsAt && value > new Date(endsAt).toISOString()));
	const errors = {
		title: !title.trim() ? "Give the session a name." : "",
		start: !start ? "Pick when it starts." : outsideEvent(start) ? "This starts outside the event’s hours." : "",
		end: !end ? "Pick when it ends." : start && end <= start ? "It has to end after it starts." : outsideEvent(end) ? "This ends after the event. Pick an earlier time, or change when the event ends in Details." : "",
		description: description.length > 200 ? "Keep it to 200 characters." : "",
	};
	const problems = Object.values(errors).filter(Boolean).length;
	const show = (key: keyof typeof errors) => (tried ? errors[key] : key === "end" && end && start && end <= start ? errors.end : "");

	const submit = async () => {
		setTried(true);
		setServerError("");
		if (problems) return;
		setSaving(true);
		try {
			await saveSession(eventId, session?.id ?? null, { title: title.trim(), description, starts_at: start, ends_at: end, lineup_ids: who });
			toast.success(session ? "Session saved." : "Session added.");
			onSaved();
			onClose();
		} catch (error) {
			setServerError(ensureError(error).message || "We couldn’t save the session. Try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<Sheet
				open={open}
				onClose={onClose}
				title={session ? "Edit session" : "Add a session"}
				subtitle={eventTitle}
				submitLabel={session ? "Save changes" : "Add session"}
				isSaving={saving}
				footNote={serverError || (tried && problems ? `Fix ${problems === 1 ? "1 thing" : `${problems} things`} above to save it.` : "")}
				onSubmit={submit}
			>
				<p className="text-[14px] text-auth-muted">{describeRun(eventTitle, startsAt, endsAt)} Times are Lagos time.</p>

				<div className="grid gap-1.5">
					<label htmlFor="session-title" className={fieldLabel}>
						Session name
					</label>
					<input
						id="session-title"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="e.g. Doors open"
						maxLength={120}
						aria-invalid={Boolean(show("title"))}
						className={controlClass(Boolean(show("title")), "h-11")}
					/>
					{show("title") && <ErrorText id="session-title-error">{show("title")}</ErrorText>}
				</div>

				<div className="grid gap-1.5">
					<label htmlFor="session-start" className={fieldLabel}>
						Starts
					</label>
					<SelectField
						id="session-start"
						value={start}
						onChange={(value: string) => {
							setStart(value);
							if (end && end <= value) setEnd("");
						}}
						options={withCurrent(startOptions, start)}
						placeholder="Pick a time"
						aria-invalid={Boolean(show("start"))}
					/>
					{show("start") && <ErrorText id="session-start-error">{show("start")}</ErrorText>}
				</div>

				<div className="grid gap-1.5">
					<label htmlFor="session-end" className={fieldLabel}>
						Ends
					</label>
					<SelectField id="session-end" value={end} onChange={(value: string) => setEnd(value)} options={withCurrent(endOptions, end)} placeholder={start ? "Pick a time" : "Pick when it starts first"} aria-invalid={Boolean(show("end"))} disabled={!start} />
					{show("end") ? <ErrorText id="session-end-error">{show("end")}</ErrorText> : start && end && <p className="text-[13px] text-auth-muted">{describeLength(start, end)}</p>}
				</div>

				<div className="grid gap-1.5">
					<div className="flex items-baseline justify-between">
						<label htmlFor="session-description" className={fieldLabel}>
							Description <span className="font-medium text-auth-muted">(optional)</span>
						</label>
						<span className={classNames("text-[13px]", description.length > 200 ? "text-auth-error" : "text-auth-muted")}>{description.length} / 200</span>
					</div>
					<textarea
						id="session-description"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						placeholder="What happens, in a line or two"
						rows={3}
						aria-invalid={Boolean(show("description"))}
						className={controlClass(Boolean(show("description")), "resize-y py-3")}
					/>
					{show("description") && <ErrorText id="session-description-error">{show("description")}</ErrorText>}
				</div>

				<fieldset className="grid gap-2">
					<legend className={classNames(fieldLabel, "mb-2")}>
						Who’s on <span className="font-medium text-auth-muted">(optional)</span>
					</legend>
					{lineup.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{lineup.map((person) => {
								const on = who.includes(person.id);
								return (
									<button
										key={person.id}
										type="button"
										role="checkbox"
										aria-checked={on}
										onClick={() => setWho((current) => (on ? current.filter((id) => id !== person.id) : [...current, person.id]))}
										className={classNames(
											"inline-flex h-11 items-center gap-2 rounded-full border bg-white py-1 pl-1 pr-3 text-[14px] font-semibold text-auth-ink transition-colors",
											on ? "border-primary-500 shadow-[0_0_0_1px_#29285C]" : "border-auth-line hover:border-auth-field"
										)}
									>
										<Face name={person.artist_name} image={person.artist_image_url} size="size-8" text="text-[11px]" />
										{person.artist_name}
										<span className={classNames("grid size-[18px] place-items-center rounded-full border", on ? "border-primary-500 bg-primary-500 text-white" : "border-auth-field")}>
											{on && <Check aria-hidden="true" className="size-3" strokeWidth={3} />}
										</span>
									</button>
								);
							})}
						</div>
					)}
					<button type="button" onClick={onNewPerson} className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold text-auth-link hover:text-primary-500">
						<Plus aria-hidden="true" className="size-4" />
						Add someone new
					</button>
				</fieldset>

				{session && (
					<button type="button" onClick={() => setConfirmDelete(true)} className="w-fit text-[14px] font-semibold text-auth-error hover:text-auth-error-ink">
						Delete this session
					</button>
				)}
			</Sheet>
			<ConfirmDialog
				open={confirmDelete}
				onOpenChange={setConfirmDelete}
				title={`Delete ${session?.title ?? "this session"}?`}
				text="It comes off the agenda. The people on it stay in the lineup."
				confirmLabel="Delete session"
				icon={<X />}
				onConfirm={async () => {
					if (!session) return;
					await deleteSession(eventId, session.id);
					toast.success("Session deleted.");
					onSaved();
					onClose();
				}}
			/>
		</>
	);
}

/** Adds someone to the lineup or changes them: photo, name, about, set time, links and headliner. */
export function PersonSheet({ person, onCreated, ...common }: Common & { person: LineupPerson | null; onCreated?: (person: LineupPerson) => void }) {
	const { open, onClose, eventId, eventTitle, options, onSaved } = common;
	const [name, setName] = React.useState("");
	const [about, setAbout] = React.useState("");
	const [start, setStart] = React.useState("");
	const [end, setEnd] = React.useState("");
	const [links, setLinks] = React.useState<string[]>([""]);
	const [headliner, setHeadliner] = React.useState(false);
	const [photo, setPhoto] = React.useState<File | null>(null);
	const [preview, setPreview] = React.useState<string | null>(null);
	const [tried, setTried] = React.useState(false);
	const [saving, setSaving] = React.useState(false);
	const [serverError, setServerError] = React.useState("");
	const [confirmRemove, setConfirmRemove] = React.useState(false);
	const fileInput = React.useRef<HTMLInputElement>(null);

	React.useEffect(() => {
		if (!open) return;
		setName(person?.artist_name ?? "");
		setAbout(person?.notes ?? "");
		setStart(optionForHHMM(options, person?.start_time));
		setEnd(optionForHHMM(options, person?.end_time));
		setLinks(person?.socials?.length ? person.socials : [""]);
		setHeadliner(person?.is_headliner ?? false);
		setPhoto(null);
		setPreview(person?.artist_image_url ?? null);
		setTried(false);
		setServerError("");
		// Fill the form when it opens.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, person?.id]);

	const badLink = links.some((link) => link.trim() && !/^(https?:\/\/)?[^\s.]+\.[^\s]+$/i.test(link.trim()));
	const errors = {
		name: !name.trim() ? "Add their name." : "",
		about: about.length > 250 ? "Keep it to 250 characters." : "",
		end: start && end && end <= start ? "Their set has to end after it starts." : !start && end ? "Pick when their set starts too." : "",
		links: badLink ? "Enter full links, like instagram.com/name." : "",
		photo: photo && photo.size > 10 * 1024 * 1024 ? "Photos can be up to 10 MB." : "",
	};
	const problems = Object.values(errors).filter(Boolean).length;
	const show = (key: keyof typeof errors) => (tried || key === "end" ? errors[key] : "");

	const pickPhoto = (file: File | undefined) => {
		if (!file) return;
		setPhoto(file);
		setPreview(URL.createObjectURL(file));
	};

	const submit = async () => {
		setTried(true);
		setServerError("");
		if (problems) return;
		setSaving(true);
		try {
			const saved = await savePerson(eventId, person?.id ?? null, {
				name,
				about,
				start_time: start ? toHHMM(start) : "",
				end_time: end ? toHHMM(end) : "",
				links,
				headliner,
				photo,
			});
			toast.success(person ? "Saved." : `${saved.artist_name} is in the lineup.`);
			onCreated?.(saved);
			onSaved();
			onClose();
		} catch (error) {
			setServerError(ensureError(error).message || "We couldn’t save them. Try again.");
		} finally {
			setSaving(false);
		}
	};

	return (
		<>
			<Sheet
				open={open}
				onClose={onClose}
				title={person ? "Edit lineup" : "Add to the lineup"}
				subtitle={eventTitle}
				submitLabel={person ? "Save changes" : "Add to lineup"}
				isSaving={saving}
				footNote={serverError || (tried && problems ? `Fix ${problems === 1 ? "1 thing" : `${problems} things`} above to save.` : "")}
				onSubmit={submit}
			>
				<div className="grid gap-2">
					<span className={fieldLabel}>
						Photo <span className="font-medium text-auth-muted">(optional)</span>
					</span>
					<div className="flex items-center gap-4">
						{preview ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={preview} alt="" className="size-[72px] rounded-full object-cover" />
						) : (
							<span aria-hidden="true" className="grid size-[72px] place-items-center rounded-full border border-dashed border-auth-field text-auth-muted">
								<User className="size-6" />
							</span>
						)}
						<div className="grid gap-1">
							<button type="button" onClick={() => fileInput.current?.click()} className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink hover:border-auth-field-hover">
								<Upload aria-hidden="true" className="size-4" />
								{preview ? "Change photo" : "Upload a photo"}
							</button>
							<span className="text-[13px] text-auth-muted">A square photo works best.</span>
						</div>
						<input ref={fileInput} type="file" hidden accept="image/jpeg,image/png,image/webp" onChange={(e) => pickPhoto(e.target.files?.[0])} />
					</div>
					{show("photo") && <ErrorText id="person-photo-error">{show("photo")}</ErrorText>}
				</div>

				<div className="grid gap-1.5">
					<label htmlFor="person-name" className={fieldLabel}>
						Name
					</label>
					<input id="person-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Their name or stage name" maxLength={100} aria-invalid={Boolean(show("name"))} className={controlClass(Boolean(show("name")), "h-11")} />
					{show("name") && <ErrorText id="person-name-error">{show("name")}</ErrorText>}
				</div>

				<div className="grid gap-1.5">
					<div className="flex items-baseline justify-between">
						<label htmlFor="person-about" className={fieldLabel}>
							About <span className="font-medium text-auth-muted">(optional)</span>
						</label>
						<span className={classNames("text-[13px]", about.length > 250 ? "text-auth-error" : "text-auth-muted")}>{about.length} / 250</span>
					</div>
					<textarea id="person-about" value={about} onChange={(e) => setAbout(e.target.value)} placeholder="A line about them" rows={3} className={controlClass(Boolean(show("about")), "resize-y py-3")} />
					{show("about") && <ErrorText id="person-about-error">{show("about")}</ErrorText>}
				</div>

				<fieldset className="grid gap-3">
					<legend className={classNames(fieldLabel, "mb-1")}>
						Set time <span className="font-medium text-auth-muted">(optional)</span>
					</legend>
					{options.length ? (
						<>
							<div className="grid gap-1.5">
								<label htmlFor="person-start" className={fieldLabel}>
									Starts
								</label>
								<SelectField id="person-start" value={start || NONE} onChange={(value: string) => setStart(value === NONE ? "" : value)} options={[{ value: NONE, label: "No set time" }, ...options]} placeholder="No set time" />
							</div>
							<div className="grid gap-1.5">
								<label htmlFor="person-end" className={fieldLabel}>
									Ends
								</label>
								<SelectField id="person-end" value={end || NONE} onChange={(value: string) => setEnd(value === NONE ? "" : value)} options={[{ value: NONE, label: "No end time" }, ...options.filter((option) => !start || option.value > start)]} placeholder="No end time" aria-invalid={Boolean(show("end"))} />
								{show("end") && <ErrorText id="person-end-error">{show("end")}</ErrorText>}
							</div>
						</>
					) : (
						<p className="text-[13px] text-auth-muted">Set the event’s date and time in Details to give them a set time.</p>
					)}
				</fieldset>

				<div className="grid gap-2">
					<span className={fieldLabel}>
						Links <span className="font-medium text-auth-muted">(optional)</span>
					</span>
					{links.map((link, index) => (
						<div key={index} className="flex gap-2">
							<input
								value={link}
								onChange={(e) => setLinks((current) => current.map((item, i) => (i === index ? e.target.value : item)))}
								placeholder="Instagram, website or music link"
								aria-label={`Link ${index + 1}`}
								className={controlClass(Boolean(show("links")) && Boolean(link.trim()), "h-11 flex-1")}
							/>
							{links.length > 1 && (
								<button type="button" aria-label={`Remove link ${index + 1}`} onClick={() => setLinks((current) => current.filter((_, i) => i !== index))} className="grid size-11 place-items-center rounded-lg text-auth-muted hover:bg-auth-page hover:text-auth-ink">
									<X aria-hidden="true" className="size-4" />
								</button>
							)}
						</div>
					))}
					{show("links") && <ErrorText id="person-links-error">{show("links")}</ErrorText>}
					{links.length < 5 && (
						<button type="button" onClick={() => setLinks((current) => [...current, ""])} className="inline-flex w-fit items-center gap-1.5 text-[14px] font-semibold text-auth-link hover:text-primary-500">
							<Plus aria-hidden="true" className="size-4" />
							Add another link
						</button>
					)}
				</div>

				<div className="flex items-start justify-between gap-4">
					<div>
						<p id="person-headliner" className="text-[14px] font-bold text-auth-ink">
							Headliner
						</p>
						<p className="text-[13px] text-auth-muted">Marked as a headliner on the event page.</p>
					</div>
					<Toggle on={headliner} onChange={() => setHeadliner(!headliner)} labelledBy="person-headliner" />
				</div>

				{person && (
					<button type="button" onClick={() => setConfirmRemove(true)} className="w-fit text-[14px] font-semibold text-auth-error hover:text-auth-error-ink">
						Remove from lineup
					</button>
				)}
			</Sheet>
			<ConfirmDialog
				open={confirmRemove}
				onOpenChange={setConfirmRemove}
				title={`Remove ${person?.artist_name ?? "them"} from the lineup?`}
				text="They come off the lineup and any session they’re on."
				confirmLabel="Remove"
				icon={<X />}
				onConfirm={async () => {
					if (!person) return;
					await removePerson(person.id);
					toast.success("Removed from the lineup.");
					onSaved();
					onClose();
				}}
			/>
		</>
	);
}
