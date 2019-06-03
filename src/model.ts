type UserId = number;
export type User = {
  id: UserId;
  email: string;
  name: string;
  password?: string;
  houseIds: HouseId[];
};
export type HouseId = number;
export type House = {
  id: HouseId;
  name: string;
  users: UserId[];
  items: Item[];
};
export type ItemId = number;
export type Item = {
  id: ItemId;
  name: string;
  qty: number;
  done: boolean;
  stores: Store[];
  purchasedBy: UserId | null;
};
export type Store = {
  id: number;
  name: string;
};

// The, um, database, for now: an empty array that lives in memory
export const users: User[] = [];

export const houses: House[] = [];

export const stores: Store[] = [];

export function userWithHouses(userInfo: User) {
  return {
    ...userInfo,
    houses: userInfo.houseIds.map(houseId => houses[houseId]),
    password: 'yeah, no',
  };
}
