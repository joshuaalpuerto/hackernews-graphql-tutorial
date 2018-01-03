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
      return Object.assign({
        id: response.insertedIds[0]
      }, args);
    },
  },

  Link: {
    id: object => object._id || object.id
  },
};