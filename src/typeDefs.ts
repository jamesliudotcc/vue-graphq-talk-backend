import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String
    users: [User]
    user: User
    houses: [House]
    secret: String
  }
  type Mutation {
    login(email: String!, password: String!): LoggedInUser
    register(email: String!, password: String!, name: String!): LoggedInUser
    createHouse(name: String!): House
    createStore(name: String!): Store
  }
  type User {
    id: Int!
    email: String!
    password: String!
    name: String!
    houses: [House]
  }
  type LoggedInUser {
    token: String
    user: User
  }
  type House {
    id: Int!
    name: String!
    users: [Int]
    invitedUsers: [User]
    requestingUsers: [User]
    items: [Item]
  }
  type Item {
    id: Int!
    name: String!
    qty: Int
    done: Boolean
    stores: [Store]
    purchasedBy: User
  }
  type Store {
    id: Int!
    name: String!
  }
`;
