"use client";
import { Input } from "@/components/app/form-input";
import { formFields } from "./data";
import useForm from "./use-form";
import Button from "@/components/app/app-button";
import * as React from "react";

import { variables } from "@/constants";

export default function Form() {
	const { isLoading, formData, errors, updateForm, submit } = useForm();

	const enableSubmit = React.useMemo(() => {
		return Object.values(formData).every((value) => value.trim() !== "");
	}, [formData]);

	return (
		<form className="flex flex-col gap-4" onSubmit={submit}>
			{formFields.map((item, idx) => {
				return (
					<Input
						key={idx}
						{...item}
						value={formData[item.name as keyof typeof formData]}
						onChange={updateForm}
						disabled={isLoading}
						errorMessage={errors[item.name as keyof typeof errors]}
					/>
				);
			})}

			<div className="pt-5 space-y-3 flex flex-col items-center gap-2">
				<Button
					type="submit"
					isLoading={isLoading}
					variant={"primary"}
					className="flex items-center justify-center w-full"
					disabled={isLoading || !enableSubmit}
				>
					Sign in
				</Button>

				<a
					href={variables.EXTERNAL_LINKS.client_app}
					target="_blank"
					className="text-primary-300 hover:text-primary-1000 body-3 transition-colors"
				>
					Forgot password?
				</a>
			</div>
		</form>
	);
}
