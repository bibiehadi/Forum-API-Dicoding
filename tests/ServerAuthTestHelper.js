const Jwt = require('@hapi/jwt');

const JwtTokenManager = require('../src/Infrastructures/security/JwtTokenManager');
const AuthenticationTableTestHelper = require('./AuthenticationsTableTestHelper');

const ServerAuthTestHelper = {
  async login({ id, username }) {
    const payload = { id, username };
    const tokenManager = new JwtTokenManager(Jwt.token);

    const accessToken = await tokenManager.createAccessToken(payload);
    const refreshToken = await tokenManager.createRefreshToken(payload);

    await AuthenticationTableTestHelper.addToken(refreshToken);

    return accessToken;
  },
};

module.exports = ServerAuthTestHelper;
