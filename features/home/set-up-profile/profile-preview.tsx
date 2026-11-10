import Image from "next/image";
import classNames from "classnames";
import { ImageIcon, MapPin } from "lucide-react";

type ProfilePreviewProps = {
	name: string;
	bio: string;
	country?: string;
	logo?: string;
	cover?: string;
	className?: string;
};

// Until there's a cover, show the tile grid from the Blue Space mark, with its one amber tile.
const TILES = Array.from({ length: 24 }, (_, index) => index === 10);

function Placeholder({ className }: { className: string }) {
	return <span aria-hidden="true" className={classNames("block rounded bg-auth-info-soft", className)} />;
}

export default function ProfilePreview({ className, ...profile }: ProfilePreviewProps) {
	return (
		<aside aria-label="Preview" className={classNames("grid content-start gap-2.5", className)}>
			<div className="flex items-baseline justify-between gap-3">
				<p className="text-[13px] font-semibold text-auth-ink">Preview</p>
				<p className="text-[12px] text-auth-muted">Updates as you type</p>
			</div>
			<ProfileCard {...profile} />
		</aside>
	);
}

/** How guests see an organizer: cover, logo, name, country and bio, with placeholders for anything missing. */
export function ProfileCard({ name, bio, country, logo, cover }: Omit<ProfilePreviewProps, "className">) {
	return (
		<div className="overflow-hidden rounded-[14px] border border-auth-line bg-white shadow-[0_1px_2px_rgba(25,24,55,0.04),0_12px_32px_-16px_rgba(25,24,55,0.18)]">
			<div className="relative aspect-[3/1] bg-primary-500">
				{cover ? (
					<Image src={cover} alt="" fill sizes="380px" className="object-cover" />
				) : (
					<div aria-hidden="true" className="absolute inset-0 grid grid-cols-8 grid-rows-3 gap-1.5 p-2">
						{TILES.map((lit, index) => (
							<span key={index} className={classNames("rounded-md", lit ? "bg-accent-1000" : "bg-auth-tile")} />
						))}
					</div>
				)}
			</div>

			<div className="px-[18px] pb-5">
				<div className="relative -mt-8 grid size-16 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-auth-info-soft text-auth-placeholder shadow-[0_1px_3px_rgba(25,24,55,0.14)]">
					{logo ? (
						<Image src={logo} alt="" fill sizes="64px" className="object-cover" />
					) : (
						<ImageIcon aria-hidden="true" className="size-5" />
					)}
				</div>

				<div className="mt-3 grid gap-1.5">
					{name.trim() ? (
						<p className="break-words text-[17px] font-bold leading-[1.3] text-auth-ink">{name}</p>
					) : (
						<Placeholder className="my-1 h-3.5 w-[58%]" />
					)}
					{country ? (
						<p className="flex items-center gap-1 text-[13px] text-auth-muted">
							<MapPin aria-hidden="true" className="size-3.5" />
							{country}
						</p>
					) : (
						<Placeholder className="my-[3px] h-2.5 w-[28%]" />
					)}
					{bio.trim() ? (
						<p className="mt-1.5 line-clamp-4 whitespace-pre-line break-words text-[14px] leading-normal text-auth-muted">
							{bio}
						</p>
					) : (
						<div className="mt-2 grid gap-2">
							<Placeholder className="h-2.5 w-full" />
							<Placeholder className="h-2.5 w-[72%]" />
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
