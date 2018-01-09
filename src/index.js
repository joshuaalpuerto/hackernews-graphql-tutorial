const express = require('express');

// This package automatically parses JSON requests.
const bodyParser = require('body-parser');

// This package will handle GraphQL server requests and responses
// for you, based on your schema.
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');

const schema = require('./schema');
const connectMongo = require('./mongo_connector');
const buildDataloaders = require('./dataloaders');
const formatError = require('./formatError');
const { authenticate } = require('./authentication');

const start = async () => {
  const mongo = await connectMongo();
  const app = express();
  const PORT = 4000
  const dataloaders = buildDataloaders(mongo)
  
  const buildOptions = async (req, res) => {
    const user = await authenticate(req, dataloaders);
    return {
      // works like dependency injection
      context: { 
        mongo, 
        user,
        dataloaders,
      }, // This context object is passed to all resolvers.
      formatError,
      schema,
    };
  };
  
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-testdev@gmail.com'`,
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`
  }));

  const server = createServer(app);
  server.listen(PORT, () => {
    SubscriptionServer.create(
      {execute, subscribe, schema},
      {server, path: '/subscriptions'},
    );
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });
}

start();