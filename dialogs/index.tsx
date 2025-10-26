'use client';
import useActions from '@/store/actions';
import * as React from 'react';
import LogoutDialog from './logout-dialog';
import SuccessDialog from "./success-dialog";
import DeleteDialog from "./delete-dialog";
import InfoDialog from "./info-dialog";
import Init from '@/components/app/init';
import CreateEventDialog from './create-event';

export default function Dialogs() {
	const { ui } = useActions();

	React.useEffect(() => {
		return () => {
			ui.resetDialog();
		};
	}, []);
	return (
		<React.Fragment>
			<Init />
			<LogoutDialog />
			<DeleteDialog />
			<SuccessDialog />
			<InfoDialog />
			<CreateEventDialog />
		</React.Fragment>
	);
}
