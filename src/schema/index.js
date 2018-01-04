'use strict'
const {
  makeExecutableSchema
} = require('graphql-tools');
const resolvers = require('./resolvers');

// Define your types here.
const typeDefs = `
  type Query {
    allLinks: [Link!]!
  }

  type Mutation {
    createLink(url: String!, description: String!): Link

    createVote(linkId: ID!): Vote

    # Note that this mutation could receive the email and password directly
    # as arguments, with no problem. You're just using this "authProvider"
    # instead to mimic the signature generated by Graphcool, which will
    # make it easier to integrate this server implementation later with the 
    # code from the frontend tutorials.
    createUser(name: String!, authProvider: AuthProviderSignupData!): User

    signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!

  }

  type Subscription {
    Link(filter: SubscriptionFilter): LinkSubscriptionPayload
    User(filter: SubscriptionFilter): UserSubscriptionPayload
  }
  
  input SubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }
  
  type LinkSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Link
  }

  type UserSubscriptionPayload {
    mutation: _ModelMutationType!
    node: User
  }
  
  enum _ModelMutationType {
    CREATED
    UPDATED
    DELETED
  }

  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User
    votes: [Vote!]!
  }

  type Vote {
    id: ID!
    user: User!
    link: Link!
  }


  type User {
    id: ID!
    name: String!
    email: String
    votes: [Vote!]!
  }

  input AuthProviderSignupData {
      email: AUTH_PROVIDER_EMAIL
  }

  input AUTH_PROVIDER_EMAIL {
      email: String!
      password: String!
  }

  type SigninPayload {
    token: String
    user: User
  }
`;

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({ typeDefs, resolvers });