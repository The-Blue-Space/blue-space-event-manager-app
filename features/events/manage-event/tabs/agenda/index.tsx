"use client";
import Agenda from "./agenda";
import Lineup from "./lineup";
import TabContainer from "../../tab-container";

export default function AgendaTab() {
	return (
		<TabContainer value="agenda">
			<Agenda />
			<Lineup />
		</TabContainer>
	);
}
