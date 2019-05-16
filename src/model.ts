export type User = {
  id: number;
  email: string;
  name: string;
  password?: string;
};
export type House = {
  id: number;
  name: string;
  users: User[];
  items: Item[];
};
export type Item = {
  id: number;
  name: string;
  qty: number;
  done: boolean;
  stores: Store[];
  purchasedBy: User;
};
export type Store = {
  id: number;
  name: string;
};

// The, um, database, for now: an empty array that lives in memory
export const users: User[] = [];

export const houses: House[] = [];

export const stores: Store[] = [];
