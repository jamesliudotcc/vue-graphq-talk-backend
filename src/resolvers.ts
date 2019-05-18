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

type Context = { user: User | null };

export const resolvers = {
  Query: {
    hello: () => 'world',
    users: () => users.map(user => ({ ...user, houses: null })),
    user: (_: any, args: { onlyUnpurcahsed: boolean }, context: any) => {
      const getUserFromContext = users.filter(
        user => user.id === context.user.id
      )[0];
      const currentUser = {
        ...getUserFromContext,
        houses: getUserFromContext.houses.map(houseId => houses[houseId]),
      };

      if (!args.onlyUnpurcahsed) return currentUser;

      return {
        ...currentUser,
        houses: currentUser.houses.map(house =>
          house.items.filter(item => !item.done)
        ),
      };
    },
    secret: (root: any, args: any, context: Context) => {
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
    login: async (_: any, { email, password }: User) => {
      const foundUser = find(users, { email: email });

      if (foundUser && (await argon2.verify(foundUser.password, password))) {
        return {
          token: generateJwt(foundUser),
          user: { ...foundUser, password: '' },
        };
      } else {
        throw new ForbiddenError('Credentials no good');
      }
    },
    register: async (root: any, { email, password, name }: User) => {
      if (users.reduce((_, user) => email === user.email, false)) {
        throw new ValidationError('Email already exists');
      }

      const hashedPass = await argon2.hash(password);

      const newUser = {
        email,
        name,
        password: hashedPass,
        id: users.length,
        houses: [],
      };
      users.push(newUser);
      return {
        token: generateJwt(newUser),
        user: { ...newUser, password: 'haha, no' },
      };
    },
    createHouse: (root: any, args: { name: string }, context: Context) => {
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
      users[userId].houses.push(newHouseId);
      return newHouse;
    },
    createStore: (root: any, args: { name: string }, context: Context) => {
      if (!context.user)
        throw new ForbiddenError('Must be logged in to create store');
      const newStore: Store = {
        id: stores.length,
        name: args.name,
      };
      stores.push(newStore);
      return newStore;
    },
    createItem: (
      root: unknown,
      args: { name: string; house: number; qty: number; stores: number[] },
      context: Context
    ) => {
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
    purchaseItems: (
      root: unknown,
      args: { house: HouseId; itemIds: ItemId[] },
      context: Context
    ) => {
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
