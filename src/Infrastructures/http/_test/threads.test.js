const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerAuthTestHelper = require('../../../../tests/ServerAuthTestHelper');

describe('/threads endpoint', () => {
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

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const accessToken = await ServerAuthTestHelper.login(userDummy);

      const requestPayload = {
        title: 'dicoding',
        body: 'dicoding body thread',
      };
      // eslint-disable-next-line no-undef
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedThread).toBeDefined();
    })

    it('should response 401 when not authorized', async () => {
      // Arrange
      const requestPayload = {
        title: 'dicoding',
        body: 'dicoding body thread',
      };
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.error).toEqual('Unauthorized');
      expect(responseJson.message).toEqual('Missing authentication');
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      await UsersTableTestHelper.addUser(userDummy);
      const requestPayload = {
        title: 481232,
        body: true,
      };
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

  describe('when GET /threads/{id}', () => {
    it('should response 200 and persisted thread', async () => {
      // Arrange
      const server = await createServer(container);

      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread(threadDummy, 'user-1234');

      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-1234',
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const requestPayload = {
        title: 'Dicoding Indonesia',
      };
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
    });

    it('should response 400 when request payload not meet data type specification', async () => {
      // Arrange
      await UsersTableTestHelper.addUser(userDummy);
      const requestPayload = {
        title: 481232,
        body: true,
      };
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena tipe data tidak sesuai');
    });
  });

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
  })


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
  })

  describe('when POST /threads/{threadId}/comments/{commentId}/replies', () => {
    it('should response 200 and persisted comment reply', async () => {
      const server = await createServer(container);
      const accessToken = await ServerAuthTestHelper.login(userDummy2);
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
      await ThreadsTableTestHelper.addThread(threadDummy, 'user-1234');
      const comment = await ThreadsTableTestHelper.addComment('this is comment dummy', threadDummy.id, 'user-1234', 'comment-1234');
      const requestPayload = {
        content: 'this is comment reply',
      };
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${threadDummy.id}/comments/${comment.id}/replies`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        payload: requestPayload,
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedReply).toBeDefined();
    });
  })

  describe('when DELETE /threads/{threadId}/comments/{commentId}/replies/{replyId}', () => {
    it('should response 200 and persisted comment', async () => {
      const server = await createServer(container);
      const accessToken = await ServerAuthTestHelper.login(userDummy);
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await ThreadsTableTestHelper.addThread(threadDummy, 'user-1234');
      const comment = await ThreadsTableTestHelper.addComment('this is comment dummy', threadDummy.id, 'user-1234', 'comment-1234');
      const reply = await ThreadsTableTestHelper.addReplyComment({ content: 'this is comment reply dummy'}, comment.id, 'user-1234', 'reply-1234');
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${threadDummy.id}/comments/${comment.id}/replies/${reply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.deletedReply).toBeDefined();
    });
  })
});
