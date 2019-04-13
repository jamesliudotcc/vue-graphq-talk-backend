import { ApolloServer, gql } from 'apollo-server';

import { find } from 'lodash';
// import express from 'express';

import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import * as jwt from 'jsonwebtoken';

type User = { email: string; name: string; password?: string; id?: number };

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

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
      hello: String
      users: [User]
      user(id: Int!): User!
      secret: String
    }
    type Mutation {
      login(email: String!, password: String!): LoggedInUser
      register(email: String!, password: String!, name: String!): LoggedInUser
    }
    type User {
      id: Int!
      email: String!
      password: String!
      name: String!
    }
    type LoggedInUser {
      token: String
      user: User
    }
  `;

  const resolvers = {
    Query: {
      hello: () => 'world',
      users: () => users,
      user: (_: any, args: { id: number }) => find(users, { id: args.id }),
      secret: () => 'secret',
    },
    Mutation: {
      login: async (_: any, { email, password }: User) => {
        const foundUser = find(users, { email: email });

        if (foundUser && (await argon2.verify(foundUser.password, password))) {
          return {
            token: generateJwt(foundUser),
            user: { ...foundUser, password: '' },
          };
        }
      },
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
        return {
          token: generateJwt(newUser),
          user: { ...newUser, password: 'haha, no' },
        };
      },
    },
  };

  const server = new ApolloServer({ typeDefs, resolvers });

  server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
  });

  function generateJwt(user: User) {
    return jwt.sign({ ...user, password: '' }, JWT_SECRET, {
      expiresIn: '1d',
    });
  }
})();
