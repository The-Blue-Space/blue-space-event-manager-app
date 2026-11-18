"use client";
import Link from "next/link";
import classNames from "classnames";
import { Check, Plus, Wallet } from "lucide-react";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { ProfileCard } from "../set-up-profile/profile-preview";
import { IconCircle } from "./ui";

const STEPS = [
	{ title: "Set up your organizer profile", detail: "" },
	{ title: "Create your event", detail: "Give it a name, date and venue. It stays a draft until you publish it." },
	{ title: "Add ticket types", detail: "Set prices and how many of each you'll sell." },
	{ title: "Publish and share the link", detail: "Guests can buy tickets as soon as the event is published." },
];
const CURRENT_STEP = 1;

export default function GetStarted({ hasBankAccount }: { hasBankAccount: boolean }) {
	const { managerProfile } = useAppSelector("manager_profile");
	const { ui } = useActions();

	return (
		<div className="flex flex-wrap items-start gap-8">
			<div className="grid min-w-0 flex-[999_1_520px] gap-6">
				<section aria-labelledby="get-started" className="grid gap-[18px] rounded-[14px] border border-auth-line p-5 sm:p-6">
					<div className="grid gap-2.5">
						<div className="flex items-baseline justify-between gap-4">
							<h2 id="get-started" className="text-[18px] font-bold text-auth-ink">
								Get your first event on sale
							</h2>
							<span className="shrink-0 text-[13px] text-auth-muted">1 of 4 done</span>
						</div>
						<div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-auth-info-soft">
							<div className="h-full w-1/4 rounded-full bg-auth-success" />
						</div>
					</div>

					<ol>
						{STEPS.map((step, index) => {
							const done = index < CURRENT_STEP;
							const current = index === CURRENT_STEP;
							return (
								<li
									key={step.title}
									aria-current={current ? "step" : undefined}
									className={classNames(
										"flex flex-wrap items-center gap-x-3.5 gap-y-3",
										current ? "-mx-3 rounded-xl bg-auth-page p-3 sm:-mx-4 sm:p-4" : "border-t border-auth-info-soft py-3.5 first:border-0"
									)}
								>
									<span
										aria-hidden="true"
										className={classNames(
											"grid size-7 shrink-0 place-items-center rounded-full text-[13px] font-bold",
											done && "bg-auth-success text-white",
											current && "bg-primary-500 text-white",
											!done && !current && "border border-auth-field text-auth-muted"
										)}
									>
										{done ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
									</span>
									<div className="min-w-0 flex-1 basis-56">
										<p className={classNames("text-[15px]", current ? "font-bold" : "font-semibold", done ? "text-auth-muted line-through" : "text-auth-ink")}>
											{step.title}
											{done && <span className="sr-only"> (done)</span>}
										</p>
										<p className="mt-0.5 text-[13px] leading-[1.45] text-auth-muted">
											{done ? `${managerProfile?.name ?? "Your profile"} is ready.` : step.detail}
										</p>
									</div>
									{done && (
										<Link href="/settings" className="text-[14px] font-semibold text-auth-link hover:text-primary-500">
											Edit
										</Link>
									)}
									{current && (
										<button
											type="button"
											onClick={() => ui.changeDialog({ show: true, type: "create_event" })}
											className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600"
										>
											<Plus aria-hidden="true" className="size-4" />
											Create event
										</button>
									)}
								</li>
							);
						})}
					</ol>
				</section>

				{!hasBankAccount && (
					<section aria-labelledby="get-paid" className="flex flex-wrap items-center gap-x-3.5 gap-y-3 rounded-[14px] border border-auth-line px-5 py-[18px]">
						<IconCircle>
							<Wallet className="size-[18px]" />
						</IconCircle>
						<div className="min-w-0 flex-1 basis-56">
							<h2 id="get-paid" className="text-[15px] font-bold text-auth-ink">
								Add a bank account
							</h2>
							<p className="mt-0.5 text-[13px] leading-[1.45] text-auth-muted">You’ll need one to withdraw ticket money after each event.</p>
						</div>
						<Link
							href="/finance"
							className="inline-flex h-10 items-center rounded-lg border border-auth-field px-4 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
						>
							Add bank account
						</Link>
					</section>
				)}

				<p className="max-w-[62ch] text-[14px] leading-[1.55] text-auth-muted">
					Once your first event is on sale, this page shows it at the top with tickets sold, then daily sales, recent orders and money ready to
					withdraw.
				</p>
			</div>

			{managerProfile && (
				<aside aria-labelledby="your-profile" className="grid min-w-0 max-w-[360px] flex-[1_1_300px] gap-2.5">
					<div className="flex items-baseline justify-between gap-4">
						<h2 id="your-profile" className="text-[15px] font-bold text-auth-ink">
							Your organizer profile
						</h2>
						<Link href="/settings" className="text-[14px] font-semibold text-auth-link hover:text-primary-500">
							Edit
						</Link>
					</div>
					<ProfileCard
						name={managerProfile.name ?? ""}
						bio={managerProfile.bio ?? ""}
						country={managerProfile.operating_country?.country_name}
						logo={managerProfile.logo ?? undefined}
						cover={managerProfile.display_image ?? undefined}
					/>
					<p className="text-[13px] text-auth-muted">Guests see this on your events and on your public profile.</p>
				</aside>
			)}
		</div>
	);
}
