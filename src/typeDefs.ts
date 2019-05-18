import { gql } from 'apollo-server';

export const typeDefs = gql`
  type Query {
    hello: String
    users: [User]
    user(onlyUnpurchased: Boolean = true): User
    houses: [House]
    stores: [Store]
    secret: String
  }
  type Mutation {
    login(email: String!, password: String!): LoggedInUser
    register(email: String!, password: String!, name: String!): LoggedInUser
    createHouse(name: String!): House
    createStore(name: String!): Store
    createItem(name: String!, house: Int!, stores: [Int], qty: Int!): Item
    purchaseItems(house: Int!, itemIds: [Int]!): [Item]
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
    users: [Int] #Note, not users
    invitedUsers: [User]
    # change to requestingInviteUsers
    requestingUsers: [User]
    items: [Item]
  }
  type Item {
    id: Int!
    name: String!
    qty: Int
    done: Boolean
    stores: [Store]
    purchasedBy: Int
  }
  type Store {
    id: Int!
    name: String!
  }
`;
