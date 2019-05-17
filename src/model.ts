type UserId = number;
export type User = {
  id: UserId;
  email: string;
  name: string;
  password?: string;
  houses: HouseId[];
};
export type HouseId = number;
export type House = {
  id: number;
  name: string;
  users: UserId[];
  items: Item[];
};
export type Item = {
  id: number;
  name: string;
  qty: number;
  done: boolean;
  stores: Store[];
  purchasedBy: User | null;
};
export type Store = {
  id: number;
  name: string;
};

// The, um, database, for now: an empty array that lives in memory
export const users: User[] = [];

export const houses: House[] = [];

export const stores: Store[] = [];
