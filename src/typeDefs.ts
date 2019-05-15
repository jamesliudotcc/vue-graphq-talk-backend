import { gql } from 'apollo-server';

export const typeDefs = gql`
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
