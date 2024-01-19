const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerAuthTestHelper = require('../../../../tests/ServerAuthTestHelper');

describe('/threads/{threadId}/comments/ endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  const userDummy = {
    id: 'user-1234',
    username: 'dicoding',
  };

  const userDummy2 = {
    id: 'user-1235',
    username: 'dicoding2',
  };

  const threadDummy = {
    id: 'thread-1234',
    title: 'dicoding',
    body: 'dicoding body thread',
  };

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 200 and persisted comment', async () => {
      const server = await createServer(container);
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread(threadDummy, 'user-1234');
      const requestPayload = {
        content: 'this is comment',
      };
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadDummy.id}/comments`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 and persisted comment', async () => {
      const server = await createServer(container);
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread(threadDummy, 'user-1234');
      const comment = await ThreadsTableTestHelper.addComment('this is comment dummy', threadDummy.id, 'user-1234', 'comment-1234');
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadDummy.id}/comments/${comment.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.deletedComment).toBeDefined();
    });
  });
});
