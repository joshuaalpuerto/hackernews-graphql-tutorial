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
    createLink: async (_, args, { mongo: { Links } }) => {
      const response = await Links.insert(args);
      return Object.assign({ id: response.insertedIds[0] }, args);
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
      const response = await Users.insert(newUser);
      return Object.assign({ id: response.insertedIds[0] }, newUser);
    },
  },

  Link: {
    id: object => object._id || object.id
  },
};