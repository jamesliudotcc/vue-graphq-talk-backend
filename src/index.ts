import { ApolloServer, gql } from 'apollo-server';

import { find } from 'lodash';
// import express from 'express';

import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';
import { findAddedNonNullDirectiveArgs } from 'graphql/utilities/findBreakingChanges';

type User = { email: string; name: string; password?: string; id?: number };

dotenv.config();

const { JWT_SECRET } = process.env;

(async () => {
  const users: User[] = [
    {
      email: 'test@test.com',
      id: 1,
      name: 'Test User',
      password: await argon2.hash('password'),
    },
  ];
  const typeDefs = gql`
    type Query {
      "A simple type for getting started!"
      hello: String
      users: [User]
      user(id: Int!): User!
    }
    type Mutation {
      register(email: String!, password: String!, name: String!): User
    }
    type User {
      id: Int!
      email: String!
      password: String!
      name: String!
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'world',
      users: () => users,
      user: (_: any, args: { id: number }) => find(users, { id: args.id }),
    },
    Mutation: {
      register: async (_: any, { email, password, name }: User) => {
        if (users.reduce((_, user) => email === user.email, false)) {
          // TODO: Provide better error message
          return null;
        }
        const hashedPass = await argon2.hash(password);
        const newUser = {
          email,
          name,
          password: hashedPass,
          id: users.length + 1,
        };
        users.push(newUser);
        return newUser;
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });

  console.log(jwt.sign(users[0], JWT_SECRET || 'secret'));
})();
