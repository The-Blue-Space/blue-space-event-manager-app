import Image from "next/image";
import classNames from "classnames";
import { assets } from "@/constants";

// Each tile is a "memory shard" from a different kind of event, echoing the tile grid in the logo.
const MEMORIES = [
	{ src: "festival-stage-lights", opacity: 0.22 },
	{ src: "wedding-bouquet", opacity: 0.15 },
	{ src: "conference-audience", opacity: 0.26 },
	{ src: "birthday-balloons", opacity: 0.18 },
	{ src: "confetti-crowd", opacity: 0.2 },
	{ src: "friends-dinner", opacity: 0.22 },
	{ src: "champagne-toast", opacity: 0.15 },
	{ src: "filming-the-stage", opacity: 0.26 }, // the lit tile: the moment being captured now
	{ src: "neon-concert", opacity: 0.18 },
	{ src: "wedding-table", opacity: 0.2 },
	{ src: "color-festival", opacity: 0.22 },
	{ src: "keynote", opacity: 0.15 },
	{ src: "wine-toast", opacity: 0.26 },
	{ src: "heart-hands", opacity: 0.18 },
	{ src: "string-lights-party", opacity: 0.2 },
	{ src: "dinner-table-flowers", opacity: 0.22 },
	{ src: "golden-concert", opacity: 0.15 },
	{ src: "gallery-talk", opacity: 0.26 },
	{ src: "confetti-stage", opacity: 0.18 },
	{ src: "fairy-lights", opacity: 0.2 },
];
const LIT_TILE = 7;

export default function BrandPanel() {
	return (
		<aside className="relative isolate flex items-center overflow-hidden bg-primary-500 px-5 py-4 text-white lg:sticky lg:top-0 lg:h-dvh lg:flex-col lg:items-stretch lg:justify-between lg:gap-8 lg:px-10 lg:py-9">
			<div className="relative z-10 flex items-center gap-3">
				<Image src={assets.logo_white} alt="" priority sizes="64px" className="h-[26px] w-auto lg:h-[30px]" />
				<Image
					src={assets.logo_text_white}
					alt="Blue Space"
					priority
					sizes="120px"
					className="h-[15px] w-auto lg:h-[17px]"
				/>
			</div>

			<div
				aria-hidden="true"
				className="pointer-events-none absolute left-[20%] right-[-34%] top-[15%] z-0 hidden origin-left grid-cols-5 gap-2.5 [transform:perspective(900px)_rotateY(-34deg)_rotateX(9deg)] lg:grid"
			>
				{MEMORIES.map((memory, index) => {
					const lit = index === LIT_TILE;
					return (
						<span
							key={memory.src}
							className={classNames(
								"relative aspect-[4/3] overflow-hidden rounded-[10px]",
								lit ? "bg-accent-1000" : "bg-auth-tile"
							)}
						>
							<Image
								src={`/images/memories/${memory.src}.jpg`}
								alt=""
								fill
								sizes="120px"
								style={{ opacity: lit ? 0.42 : memory.opacity }}
								className={classNames(
									"object-cover grayscale",
									lit
										? "mix-blend-multiply contrast-[1.15] brightness-[1.15]"
										: "mix-blend-luminosity contrast-[1.08]"
								)}
							/>
						</span>
					);
				})}
			</div>

			<div className="relative z-10 hidden gap-3 lg:grid">
				<p className="text-[28px] font-semibold leading-[1.2] tracking-[-0.015em] [text-wrap:balance]">
					Run the event.
					<br />
					Keep every moment.
				</p>
				<p className="max-w-[36ch] text-[15px] leading-[1.55] text-white/75">
					Sell tickets, check guests in at the door, and collect every photo from the night in one shared
					album.
				</p>
			</div>

			<p className="relative z-10 hidden text-[13px] text-white/65 lg:block">
				Organizer portal · Same account as the Blue Space app
			</p>
		</aside>
	);
}
