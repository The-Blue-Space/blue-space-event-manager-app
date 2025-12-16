import classNames from "classnames";
import React from "react";
interface PinInputProps {
	valueLength: number;
	value: string;
	onChange(e: string): void;
	inputClass?: string;
	containerStyle?: string;
	masked?: boolean;
}
export default function PinInput(props: PinInputProps) {
	const { onChange, value, valueLength, masked } = props;

	const containerStyle = classNames(
		"flex w-full items-center justify-center",
		props.containerStyle
	);

	const inputClass = classNames(
		"border-black rounded-md font-bold mx-1 w-full text-center bg-white border text-xl",
		props.inputClass
	);

	const RE_DIGIT = React.useMemo(() => new RegExp(/^\d+$/), []);
	const valueItems = React.useMemo(() => {
		const valueArray = value.split("");
		const items: string[] = [];
		for (let i = 0; i < valueLength; i++) {
			const char = valueArray[i];
			if (RE_DIGIT.test(char)) items.push(char);
			else items.push("");
		}
		return items;
	}, [value, valueLength, RE_DIGIT]);
	const focusToNextInput = (target: HTMLElement) => {
		const nextElementSibling = target.nextElementSibling as HTMLInputElement | null;
		if (nextElementSibling) {
			nextElementSibling.focus();
		}
	};
	const focusToPrevInput = (target: HTMLElement) => {
		const previousElementSibling = target.previousElementSibling as HTMLInputElement | null;
		if (previousElementSibling) {
			previousElementSibling.focus();
		}
	};
	const inputOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
		const { key } = e;
		const target = e.target as HTMLInputElement;
		if (key === "ArrowRight" || key === "ArrowDown") {
			e.preventDefault();
			return focusToNextInput(target);
		}
		if (key === "ArrowLeft" || key === "ArrowUp") {
			e.preventDefault();
			return focusToPrevInput(target);
		} 
		if (key === "Enter") {
			// e.preventDefault();
			return focusToNextInput(target);
		}
		const targetValue = target.value;
		// keep the selection range position
		// if the same digit was typed
		target.setSelectionRange(0, targetValue.length);
		const nextInputEl = target.nextElementSibling as HTMLInputElement | null;
		if ((key === "Backspace" && nextInputEl?.value === "") || idx === valueLength - 1) {
			const current = value.slice(0, idx);
			onChange(current);
		}
		if (e.key !== "Backspace" || targetValue !== "") return;
		focusToPrevInput(target);
	};
	const inputOnChange = (event: React.ChangeEvent<HTMLInputElement>, idx: number) => {
		const target = event.target;
		let targetValue = target.value.trim();
		const isTargetValueDigit = RE_DIGIT.test(targetValue);
		if (!isTargetValueDigit || targetValue === "") return;
		const nextInputEl = target.nextElementSibling as HTMLInputElement | null;
		if (!isTargetValueDigit && nextInputEl && nextInputEl.value !== "") return;
		targetValue = isTargetValueDigit ? targetValue : " ";
		const targetValueLength = targetValue.length;
		if (targetValueLength === 1) {
			const newValue = value.substring(0, idx) + targetValue + value.substring(idx + 1);
			onChange(newValue);
			if (!isTargetValueDigit) return;
			focusToNextInput(target);
		} else if (targetValueLength === valueLength) {
			onChange(targetValue);
			target.blur();
		}
	};
	const inputOnFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		const { target } = e;
		// keep focusing back until previous input
		// element has value
		const prevInputEl = target.previousElementSibling as HTMLInputElement | null;
		if (prevInputEl && prevInputEl.value === "") {
			return prevInputEl.focus();
		}
		target.setSelectionRange(0, target.value.length);
	};
	const output = valueItems.map((digit, idx) => {
		return (
			<input
				autoComplete="one-time-code"
				className={`${inputClass} ${
					digit ? "!border-2 !border-primary-300 !bg-white" : "!bg-neutral-200"
				} `}
				type={masked ? "password" : "text"}
				key={idx}
				inputMode="numeric"
				pattern="\d{1}"
				required	
				autoCorrect="off"
				autoSave="off"
				maxLength={props.valueLength}
				onChange={(e) => inputOnChange(e, idx)}
				onFocus={inputOnFocus}
				onKeyDown={(e) => inputOnKeyDown(e, idx)}
				value={digit}
			/>
		);
	});
	return <div className={containerStyle}>{output}</div>;
}
