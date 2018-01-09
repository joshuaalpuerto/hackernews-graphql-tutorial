const DataLoader = require('dataloader');

module.exports = ({ Users, Votes }) => {
  let userByIdLoader = new DataLoader(
    keys => batchUsersById(keys),
    { cacheKeyFn: key => key.toString() },
  )
  
  let userByEmailLoader = new DataLoader(
    keys => batchUsersByUsername(keys),
    { cacheKeyFn: key => key.toString() },
  )

  let votesByLinkIdLoader = new DataLoader(
    keys => batchVotesByLinkId(keys),
    { cacheKeyFn: key => key.toString() },
  )

  let votesByUserIdLoader = new DataLoader(
    keys => batchVotesByUserId(keys),
    { cacheKeyFn: key => key.toString() },
  )

  async function batchVotesByLinkId (ids) {
    const votes = await Votes.find({ linkId: { $in: ids } }).toArray();
    for (let vote of votes) {
      votesByUserIdLoader.prime(vote.userId, vote);
    }
    return votes.length ? votes : [{}]
  }

  async function batchVotesByUserId (ids) {
    const votes = await Votes.find({ userId: { $in: ids } }).toArray();
    for (let vote of votes) {
      votesByLinkIdLoader.prime(vote.linkId, vote);
    }
    
    return votes.length ? votes : [{}]
  }

  async function batchUsersById (ids) {
    const users = await Users.find({ _id: { $in: ids } }).toArray();

    for (let user of users) {
      userByEmailLoader.prime(user.email, user);
    }

    return users.length ? users : [{}]
  }
  
  async function batchUsersByUsername (emails) {
    const users = await Users.find({ email: { $in: emails } }).toArray();

    for (let user of users) {
      userByIdLoader.prime(user._id, user);
    }

    console.log(users)
    return users.length ? users : [{}]
   }

  return {
    userByIdLoader,
    userByEmailLoader,
    votesByLinkIdLoader,
    votesByUserIdLoader
  }
};