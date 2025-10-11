import { Metadata } from "next";

type Props = {	
	title: string;
	description?: string;
};

export function generateMetadata({ title, description = "" }: Props): Metadata {
	return {
		title,
		description,
	};
}
