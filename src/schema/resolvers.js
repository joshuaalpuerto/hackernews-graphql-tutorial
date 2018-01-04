const { ObjectID } = require('mongodb')

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

module.exports = {
  Query: {
    allLinks: async (_, args, { mongo: { Links } } ) => {
      return await Links.find({}).toArray();
    },
  },

  Mutation: {
    createLink: async (_, args, { mongo: { Links }, user }) => {
      const newLink = Object.assign({ postedById: user && user._id }, args)
      const response = await Links.insert({ ...newLink });
      return Object.assign({ id: response.insertedIds[0] }, newLink);
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
      const newUser = {
          name: args.name,
          email: args.authProvider.email.email,
          password: args.authProvider.email.password,
      };
      // we need to spread this since its mutating our object and its gonna be hard for us to debug it.
      const response = await Users.insert({ ...newUser });
      return Object.assign({ id: response.insertedIds[0] }, newUser)
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

  Link: {
    id: root => root._id || root.id,
    postedBy: async ({ postedById }, _, { dataloaders: { userByIdLoader } }) => {
      return await userByIdLoader.load(postedById);
    },
    votes: async ({ _id }, data, { mongo: { Votes } }) => {
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