const DataLoader = require('dataloader');

module.exports = ({ Users }) => {
  let userByIdLoader = new DataLoader(
    keys => batchUsersById(keys),
    { cacheKeyFn: key => key.toString() },
  )
  
  let userByEmailLoader = new DataLoader(
    keys => batchUsersByUsername(keys),
    { cacheKeyFn: key => key.toString() },
  )

  async function batchUsersById (ids) {
    const users = await Users.find({ _id: { $in: ids } }).toArray();
    for (let user of users) {
      userByEmailLoader.prime(user.email, user);
    }
    return users;
  }
  
  async function batchUsersByUsername (emails) {
    const users = await Users.find({ email: { $in: emails } }).toArray();
    for (let user of users) {
      userByIdLoader.prime(user._id, user);
    }
    return users;
  }

  return {
    userByIdLoader,
    userByEmailLoader
  }
};