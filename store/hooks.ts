import { AppDispatch, RootState } from ".";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const useAppDispatch: () => AppDispatch = useDispatch;
const appSelector: TypedUseSelectorHook<RootState> = useSelector;

export default function useAppSelector<Key extends keyof RootState>(key: Key): RootState[Key] {
	return appSelector((state) => state[key]);
}
