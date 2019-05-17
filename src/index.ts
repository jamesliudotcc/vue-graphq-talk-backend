import { AuthenticationError } from 'apollo-server';
import { ApolloServer } from 'apollo-server-express';
import * as dotenv from 'dotenv';
import express = require('express');
import expressPlayground from 'graphql-playground-middleware-express';

import * as jwt from 'jsonwebtoken';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

import { resolvers } from './resolvers';
import { typeDefs } from './typeDefs';

dotenv.config();
const port = process.env.GRAPHQL_PORT || 4000;

const app = express();
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req.headers.authorization || null;
    if (!token) return null;

    const user = getUser(token) || null;
    return { user };
  },
});

server.applyMiddleware({ app });

app.get('/', (_, res) => res.send('Welcome to your GraphQL API'));
app.get('/playground', expressPlayground({ endpoint: '/graphql' }));

app.listen({ port }, () => {
  console.log(
    `🚀  Server ready at http://localhost:${port}${server.graphqlPath}`
  );
});

function getUser(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw new AuthenticationError('Token is invalid');
  }
}
