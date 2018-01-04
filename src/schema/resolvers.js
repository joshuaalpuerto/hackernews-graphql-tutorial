const { ObjectID } = require('mongodb')
const { URL } = require('url');
const ValidationErrors = require('../utils/validations')
const { allLinksBuildFilter } = require('../utils/filters')
const pubsub = require('../pubsub');

const links = [
  {
    id: 1,
    url: 'http://graphql.org/',
    description: 'The Best Query Language'
  },
  {
    id: 2,
    url: 'http://dev.apollodata.com',
    description: 'Awesome GraphQL Client'
  },
];



function assertValidLink ({ url }) {
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationErrors('Link validation error: invalid url.', 'url');
  }
}

module.exports = {
  Query: {
    allLinks: async (_, { filter }, { mongo: { Links, Users } } ) => {
      let query = filter ? {$or: allLinksBuildFilter(filter)} : {};
      return await Links.find(query).toArray();
    },
  },

  Mutation: {
    createLink: async (_, args, { mongo: { Links }, user }) => {
      assertValidLink(args)
      const bodyDocument = Object.assign({ postedById: user && user._id }, args)
      const response = await Links.insert({ ...bodyDocument });

      const newLink = Object.assign({ id: response.insertedIds[0] }, bodyDocument)
      pubsub.publish('Link', {
        Link: { mutation: 'CREATED', node: newLink }
      });

      return newLink;
    },

    createVote: async (_, { linkId }, { mongo: { Votes }, user }) => {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(linkId),
      };
      const response = await Votes.insert({ ...newVote });
      return Object.assign({ id: response.insertedIds[0] }, newVote);
    },

    // Add this block right after the `createLink` mutation resolver.
    createUser: async (_, args, { mongo: { Users } }) => {
      // You need to convert the given arguments into the format for the
      // `User` type, grabbing email and password from the "authProvider".
      const bodyDocument = {
          name: args.name,
          email: args.authProvider.email.email,
          password: args.authProvider.email.password,
      };
      // we need to spread this since its mutating our object and its gonna be hard for us to debug it.
      const response = await Users.insert({ ...bodyDocument });

      const newUser = Object.assign({ id: response.insertedIds[0] }, bodyDocument)
      pubsub.publish('User', {
        User: { mutation: 'CREATED', node: newUser }
      });

      return newUser;
    },

    signinUser: async (root, args, { mongo: { Users } }) => {
      const user = await Users.findOne({ email: args.email.email });
      if (args.email.password === user.password) {
        return {
          token: `token-${user.email}`,
          user
        };
      }
    },
  },

  Subscription: {
    Link: {
      subscribe: () => pubsub.asyncIterator('Link'),
    },
    User: {
      subscribe: () => pubsub.asyncIterator('User'),
    },
  },

  Link: {
    id: root => root._id || root.id,
    postedBy: async ({ postedById }, _, { dataloaders: { userByIdLoader } }) => {
      return await userByIdLoader.load(postedById);
    },
    votes: async ({ _id }, data, { dataloaders: { votesByLinkIdLoader }, mongo: { Votes } }) => {
      // @TODO: we need to know why this throw error
      // we need to make sure that this is working since this will be a performance issue for us.
      // return await votesByLinkIdLoader.load(_id);
      return await Votes.find({ linkId: _id }).toArray();
    },
  },

  User: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,
    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ userId: _id }).toArray();
    },
  },

  Vote: {
    id: root => root._id || root.id,
    user: async ({ userId }, data, { dataloaders: { userByIdLoader } }) => {
      return await userByIdLoader.load(userId);
    },
    link: async ({ linkId }, data, { mongo: { Links } }) => {
      return await Links.findOne({ _id: linkId });
    },
  },
};