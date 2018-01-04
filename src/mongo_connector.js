const {Logger,  MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017/hackernews';

module.exports = async () => {
  const db = await MongoClient.connect(MONGO_URL);
  const dbHackerNews = db.db('hackernews')

  let logCount = 0;
  Logger.setCurrentLogger((msg, state) => {
    console.log(`MONGO DB REQUEST ${++logCount}: ${msg}`);
    console.log('--------------------------------------');
  });
  Logger.setLevel('debug');
  Logger.filter('class', ['Cursor']);
  
  return { 
    Links: dbHackerNews.collection('links'),
    Users: dbHackerNews.collection('users'),
    Votes: dbHackerNews.collection('votes'),
  };
}