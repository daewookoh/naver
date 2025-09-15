import { atom } from "jotai";

export const showLoaderOverlayAtom = atom<boolean | number>(false);

export const isSessionInitializedAtom = atom<boolean>(false);

export const isMobileAtom = atom<boolean>(false);

export const isTabletAtom = atom<boolean>(false);
