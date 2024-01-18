const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const ServerAuthTestHelper = require('../../../../tests/ServerAuthTestHelper');

describe('/threads/{threadId}/comments/{commentId}/like endpoint', () => {
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

    const threadDummy = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
    };

    describe('when PUT /threads/{threadId}/comments/{commentId}/like', () => {
        it('should response 200 and persisted comment', async () => {
            const server = await createServer(container);
            const accessToken = await ServerAuthTestHelper.login(userDummy);
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await ThreadsTableTestHelper.addThread(threadDummy, 'user-1234');
            await ThreadsTableTestHelper.addComment('this is comment', threadDummy.id, 'user-1234', 'comment-1234');

            const response = await server.inject({
                method: 'PUT',
                url: `/threads/${threadDummy.id}/comments/comment-1234/likes`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });
    });
});
