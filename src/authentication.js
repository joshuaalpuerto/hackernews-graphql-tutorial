const HEADER_REGEX = /bearer token-(.*)$/;

const authenticate = async ({ headers: { authorization } },  { userByEmailLoader }) => {
  // const email = authorization && HEADER_REGEX.exec(authorization)[1];
  // @TODO: authorization not working
  const email = 'testdev1@gmail.com'
  return email && await userByEmailLoader.load(email);
}

/**
 * This is an extremely simple token. In real applications make
 * sure to use a better one, such as JWT (https://jwt.io/).
 */
module.exports = {
  authenticate
}

