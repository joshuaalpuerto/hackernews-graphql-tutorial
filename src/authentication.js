const HEADER_REGEX = /bearer token-(.*)$/;

const authenticate = async ({ headers: { authorization } }, Users) => {
  // const email = authorization && HEADER_REGEX.exec(authorization)[1];
  // @TODO: authorization not working
  const email = 'testdev@gmail.com'
  return email && await Users.findOne({ email });
}

/**
 * This is an extremely simple token. In real applications make
 * sure to use a better one, such as JWT (https://jwt.io/).
 */
module.exports = {
  authenticate
}

