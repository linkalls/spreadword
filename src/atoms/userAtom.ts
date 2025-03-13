import { atom } from "jotai";

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export const userAtom = atom<User | null>(null);
export const loadingAtom = atom<boolean>(true);