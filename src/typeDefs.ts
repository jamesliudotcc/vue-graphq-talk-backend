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
  type House {
    name: String!
    users: [User]
    items: [Item]
  }
  type Item {
    name: String!
    qty: Int
    done: Boolean
    stores: [Store]
    house: House!
    purchasedBy: User
  }
  type Store {
    name: String!
  }
`;
