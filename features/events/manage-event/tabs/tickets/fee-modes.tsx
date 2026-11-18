import classNames from "classnames";
import { KOBO_PER_NAIRA, nairaFromKoboExact } from "./format";

export type FeeMode = "absorb" | "top";
export type FeeRates = { service: number; processing: number };

/** The Blue Space fee in kobo on a price in kobo, rounded half up to whole kobo: the same sum checkout charges. */
export const feeFor = (priceKobo: number, rates: FeeRates) => {
	const basisPoints = Math.round((rates.service + rates.processing) * 100);
	return Math.floor((priceKobo * basisPoints + 5000) / 10000);
};

const pct = (value: number) => `${Number(value.toFixed(2))}%`;

type FeeModesProps = {
	/** Whole naira; 0 while the price is empty. */
	price: number;
	rates: FeeRates | null;
	value: FeeMode;
	onChange: (value: FeeMode) => void;
};

/** "Who pays the Blue Space fee?": what guests pay and what the organizer gets for each choice. */
export default function FeeModes({ price, rates, value, onChange }: FeeModesProps) {
	const priceKobo = price * KOBO_PER_NAIRA;
	const fee = rates ? feeFor(priceKobo, rates) : 0;
	const show = (kobo: number) => (price && rates ? nairaFromKoboExact(kobo) : "—");
	const modes: { key: FeeMode; title: string; guests: string; you: string }[] = [
		{ key: "absorb", title: "Take it from my price", guests: show(priceKobo), you: show(priceKobo - fee) },
		{ key: "top", title: "Add it on top for guests", guests: show(priceKobo + fee), you: show(priceKobo) },
	];

	return (
		<fieldset className="grid gap-2">
			<legend className="mb-2 text-[13px] font-semibold text-auth-ink">Who pays the Blue Space fee?</legend>
			<div className="grid gap-2">
				{modes.map((mode) => {
					const checked = mode.key === value;
					return (
						<label
							key={mode.key}
							className={classNames(
								"flex cursor-pointer items-start gap-2.5 rounded-xl border px-3.5 py-3 transition-[border-color,box-shadow,background-color] duration-150 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-auth-link has-[:focus-visible]:ring-offset-2",
								checked
									? "border-primary-500 bg-auth-page shadow-[0_0_0_1px_#29285C]"
									: "border-auth-line bg-white hover:border-auth-field"
							)}
						>
							<input
								type="radio"
								name="fee-mode"
								value={mode.key}
								checked={checked}
								onChange={() => onChange(mode.key)}
								className="sr-only"
							/>
							<span
								aria-hidden="true"
								className={classNames(
									"mt-0.5 size-4 shrink-0 rounded-full border bg-white",
									checked ? "border-[5px] border-primary-500" : "border-auth-field"
								)}
							/>
							<span className="grid flex-1 gap-1.5">
								<span className="text-[14px] font-bold text-auth-ink">{mode.title}</span>
								<span className="flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-auth-muted">
									<span>
										Guests pay <strong className="tabular-nums text-auth-ink">{mode.guests}</strong>
									</span>
									<span>
										You get <strong className="tabular-nums text-auth-ink">{mode.you}</strong>
									</span>
								</span>
							</span>
						</label>
					);
				})}
			</div>
			{rates && (
				<p className="text-[12.5px] leading-[1.45] text-auth-muted">
					The fee is {pct(rates.service + rates.processing)} of the price: {pct(rates.service)} Blue Space service and{" "}
					{pct(rates.processing)} card processing.
				</p>
			)}
		</fieldset>
	);
}
