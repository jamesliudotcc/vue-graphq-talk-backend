export type User = {
  email: string;
  name: string;
  password?: string;
  id?: number;
};

// The, um, database, for now: an empty array that lives in memory
export const users: User[] = [];
