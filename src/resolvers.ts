import { ForbiddenError, ValidationError } from 'apollo-server';
import * as argon2 from 'argon2';
import { find } from 'lodash';

import { generateJwt } from './generateJwt';
import { House, houses, Store, stores, User, users, Item } from './model';

type Context = { user: User | null };

export const resolvers = {
  Query: {
    hello: () => 'world',
    users: () => users.map(user => ({ ...user, houses: null })),
    user: (_: any, args: any, context: any) => {
      const currentUser = users.filter(user => user.id === context.user.id)[0];
      return {
        ...currentUser,
        houses: currentUser.houses.map(houseId => houses[houseId]),
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
    register: async (_: any, { email, password, name }: User) => {
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
      users.forEach(user => {
        if (user.id === userId) user.houses.push(newHouseId);
      });
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
      root: any,
      args: { name: string; house: number; qty: number; stores: number[] },
      context: any
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
    // TODO: Purchase item
  },
};
