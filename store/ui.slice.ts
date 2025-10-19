import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type DialogType = "" | "order_details" | "success" | "delete_dialog" | "info_dialog" | "logout";
type ButtonVariant = "primary" | "muted" | "black" | "destructive" | "outline";
export type DialogPayload = {
	id?: string;
	show: boolean;
	type: DialogType;
	path?: string;
	staticData?: {
		// this is for success,info delete and any static dialogs
		title?: string;
		text?: string;
		customTitle?: React.ReactNode;
		customText?: React.ReactNode;
		customContent?: React.ReactNode;
		showTitle?: boolean;
		showText?: boolean;
		showActionButton?: boolean;
		actionButtonVariant?: ButtonVariant;
		actionButtonText?: string;
		dismissAfterAction?: boolean; // closes the modal after the action is performed mostly for delete dialogs

		showDismissButton?: boolean;
		dismissButtonVariant?: ButtonVariant;
		dismissButtonText?: string;
		allowDismiss?: boolean;
		showCloseButton?: boolean;
	};
	data?: Record<string, any> | null;
	action?: ((payload?: any) => Promise<void> | void) | null;
	dismiss?: (() => void) | null;
	prevDialog?: DialogPayload | null; // for nested dialogs
	callback?: (payload?: any) => void;
};

type UiState = {
	dialog: DialogPayload;
	pageTitle: string;
};

const initialState: UiState = {
	dialog: {
		id: "",
		show: false,
		type: "",
		path: "",
		action: null,
		data: null,
		dismiss: null,
		staticData: {
			showDismissButton: true,
			showActionButton: false,
			allowDismiss: true,
			dismissButtonVariant: "primary",
			actionButtonVariant: "primary",
			dismissButtonText: "Dismiss",
			actionButtonText: "Proceed",
			title: "",
			text: "",
		},
	},
	pageTitle: "",
};

const uiSlice = createSlice({
	name: "ui",
	initialState,
	reducers: {
		changeDialog: (state, action: PayloadAction<Partial<DialogPayload>>) => {
			return {
				...state,
				dialog: { ...state.dialog, ...action.payload },
			};
		},
		changePageTitle: (state, action: PayloadAction<string>) => {
			return {
				...state,
				pageTitle: action.payload,
			};
		},

		resetDialog: (state) => {
			if (state.dialog.prevDialog) {
				return {
					...state,
					dialog: {
						...state.dialog.prevDialog,
						prevDialog: null,
					},
				};
			}

			return {
				...state,
				dialog: initialState.dialog,
			};
		},
	},
});

export const { changeDialog, changePageTitle, resetDialog } = uiSlice.actions;
export default uiSlice.reducer;
