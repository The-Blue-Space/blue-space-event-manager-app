export type SetupValues = "basic-information" | "medias" | "agenda" | "lineup" | "ticket" | "vendor" | "publish";

type SetupTabs = {
	title: string;
	value: SetupValues;
};

// sections:
// basic information
// medias
// agenda
// lineup
// ticket
// publish

export const eventSetupTabs: SetupTabs[] = [
	{
		title: "Basic Information",
		value: "basic-information",
	},
	{
		title: "Medias",
		value: "medias",
	},
	{
		title: "Agenda",
		value: "agenda",
	},
	// {
	// 	title: "Lineup",
	// 	value: "lineup",
	// },
	{
		title: "Ticket",
		value: "ticket",
	},
	{
		title: "Vendor",
		value: "vendor",
	},
	{
		title: "Publish",
		value: "publish",
	},
];
