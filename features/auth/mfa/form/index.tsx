import PinInput from "@/components/app/form-input/otp-input";
import useForm from "./use-form";
import Button from "@/components/app/app-button";
import ResendOtp from "../resend-otp";

export default function Form() {
	const { isLoading, formData, errorMsg, updateForm, submit } = useForm();

	return (
		<form className="flex flex-col w-full gap-4" onSubmit={submit}>
			<div className="space-y-4 text-left">
				<PinInput
					value={formData.code}
					valueLength={6}
					onChange={(e) => updateForm(e)}
					inputClass="!size-10 !bg-white border-neutral-200"
					masked
					containerStyle="!justify-start gap-5"
				/>
				{errorMsg && (
					<p className="text-xs text-error-500 shake-animation">
						You&apos;ve entered a wrong code. Please try again{" "}
					</p>
				)}
				<p className="text-neutral-500 body-2">
					Didn’t receive email? <ResendOtp />
				</p>
			</div>

			<div className="pt-5 space-y-4">
				<Button
					// onClick={submit}
					type="submit"
					isLoading={isLoading}
					variant="primary"
					className="w-full"
					disabled={isLoading}
				>
					Verify
				</Button>

				{/* <div className="body-2 text-neutral-500">
					Can’t access your email?{" "}
					<Link href="?tab=backup-code" className="!p-0 button ">
						<span className="font-semibold body-2 text-primary-800">Enter Recovery Code</span>
					</Link>
				</div> */}
			</div>
		</form>
	);
}
