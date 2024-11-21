import { atom } from 'jotai';

interface User {
    id: string;
    name: string;
    email: string;
    tel: string;
    role: 'user' | 'admin';
}

export const userAtom = atom<User | null>(null);
