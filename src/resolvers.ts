import { ForbiddenError, ValidationError } from 'apollo-server';
import * as argon2 from 'argon2';
import { find } from 'lodash';

import { generateJwt } from './generateJwt';
import {
  House,
  HouseId,
  houses,
  Store,
  stores,
  User,
  users,
  Item,
  ItemId,
} from './model';

type CreateItemArgs = {
  name: string;
  house: number;
  qty: number;
  stores: number[];
};
type Context = { user: User | null };
type PurchaseArgs = { house: HouseId; itemIds: ItemId[] };

export const resolvers = {
  Query: {
    hello: () => 'world',
    users: () => users.map(user => ({ ...user, houses: null })),
    user: (_: any, args: { onlyUnpurcahsed: boolean }, context: any) => {
      console.log(context);
      const getIdUserFromContext = users.filter(
        user => user.id === context.user.id
      )[0];
      const currentUser = userWithHouses(getIdUserFromContext);
    },
    secret: (root: any, args: any, context: Context) => {
      console.log(context);
      if (!context.user) throw new ForbiddenError('No secret for you');
      return 'secret';
    },
    houses: (root: any, args: any, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to view houses');
      return houses;
    },
    stores: (root: any, args: any, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to view stores');
      return stores;
    },
  },
  Mutation: {
    login: async (root: unknown, { email, password }: User) => {
      const foundUser = find(users, { email: email });

      if (foundUser && (await argon2.verify(foundUser.password, password))) {
        return {
          token: generateJwt(foundUser),
          user: userWithHouses(foundUser),
        };
      } else {
        throw new ForbiddenError('Credentials no good');
      }
    },
    register: async (root: unknown, { email, password, name }: User) => {
      if (users.reduce((_, user) => email === user.email, false)) {
        throw new ValidationError('Email already exists');
      }

      const hashedPass = await argon2.hash(password);

      const newUser = {
        email,
        name,
        password: hashedPass,
        id: users.length,
        houseIds: [],
      };
      users.push(newUser);
      return {
        token: generateJwt(newUser),
        user: userWithHouses(newUser),
      };
    },
    createHouse: (root: unknown, args: { name: string }, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to create house');
      const newHouseId = houses.length;
      const userId = context.user.id;
      const newHouse: House = {
        id: newHouseId,
        name: args.name,
        users: [userId],
        items: [],
      };
      houses.push(newHouse);
      users[userId].houseIds.push(newHouseId);
      return newHouse;
    },
    createStore: (root: unknown, args: { name: string }, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to create store');
      const newStore: Store = {
        id: stores.length,
        name: args.name,
      };
      stores.push(newStore);
      return newStore;
    },
    createItem: (root: unknown, args: CreateItemArgs, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to create item');
      const house = houses[args.house];
      const newItem: Item = {
        id: house.items.length,
        name: args.name,
        qty: args.qty,
        stores: args.stores.map(storeId => stores[storeId]),
        done: false,
        purchasedBy: null,
      };
      house.items.push(newItem);
      return newItem;
    },
    purchaseItems: (root: unknown, args: PurchaseArgs, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to mark as purchased');
      console.log(args.itemIds);
      args.itemIds.forEach(itemId => {
        houses[args.house].items.forEach(item => {
          if (item.id === itemId && context.user) {
            item.done = true;
            item.purchasedBy = context.user.id;
          }
        });
      });
      return houses[args.house].items.filter(item => !item.done);
    },
  },
};

function userWithHouses(userInfo: User) {
  return {
    ...userInfo,
    houses: userInfo.houseIds.map(houseId => houses[houseId]),
    password: 'yeah, no',
  };
}
