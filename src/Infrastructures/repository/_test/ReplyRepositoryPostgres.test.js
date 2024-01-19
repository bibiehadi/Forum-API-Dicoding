const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');


describe('CommentRepository postgres', () => {
    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    const fakeIdGenerator = () => '1234';

    const user1 = { id: 'user-1234', username: 'dicoding' };
    const user2 = { id: 'user-1235', username: 'dicoding2' };
    const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
    };
    const commentThread = {
        content: 'message', threadId: 'thread-1234', userId: 'user-1234', commentId: 'comment-1234',
    }



    describe('getRepliesComment function', () => {
        it('should return empty array when no comment are found in thread', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            const replies = await replyRepositoryPostgres.getRepliesByThread();
            expect(replies).toHaveLength(0);
        });

        it('should return list of comment when replies are found', async () => {
            await UsersTableTestHelper.addUser(user1);
            await UsersTableTestHelper.addUser(user2);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await ThreadsTableTestHelper.addComment(comment, 'thread-1234', 'user-1234', 'comment-1234');
            const created_at = new Date().getMinutes();
            await ThreadsTableTestHelper.addReplyComment(reply, 'comment-1234', 'user-1235','reply-1234');
            const replies = await replyRepositoryPostgres.getRepliesByThread('thread-1234');

            expect(replies[0].id).toEqual('reply-1234');
            expect(replies[0].content).toEqual(reply.content);
            expect(replies[0].username).toEqual('dicoding2');

            expect(new Date(replies[0].date).getMinutes()).toBe(created_at);
            expect(replies[0].comment_id).toEqual('comment-1234');
            expect(replies[0].is_deleted).toEqual(false);
        });
    });

    describe('addRepliesComment function', () => {
        it('should return empty array when no comment are found in thread', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
            await expect(replyRepositoryPostgres.getRepliesByThread()).resolves.not.toThrowError(NotFoundError);
        });

        it('should return list of comment when replies are found', async () => {
            await UsersTableTestHelper.addUser(user1);
            await UsersTableTestHelper.addUser(user2);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await ThreadsTableTestHelper.addComment(comment, 'thread-1234', 'user-1234', 'comment-1234');
            const created_at = new Date().getMinutes();
            await replyRepositoryPostgres.addReplyComment(reply, 'comment-1234', 'user-1235','reply-1234');
            const addedReply = await ThreadsTableTestHelper.findReplyById('reply-1234');

            expect(addedReply.id).toEqual('reply-1234');
            expect(addedReply.content).toEqual(reply.content);
            expect(addedReply.username).toEqual('dicoding2');
            expect(new Date(addedReply.date).getMinutes()).toBe(created_at);
            expect(addedReply.comment_id).toEqual('comment-1234');
            expect(addedReply.is_deleted).toEqual(false);
        });
    });

    describe('findReplyById function', () => {
        it('should throw NotFoundError when thread not found', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            return expect(replyRepositoryPostgres.findReplyById('reply-xxxx')).rejects.toThrowError(NotFoundError);
        });

        it('should return a reply where founded', async () => {
            await UsersTableTestHelper.addUser(user1);
            await UsersTableTestHelper.addUser(user2);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);


            await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await ThreadsTableTestHelper.addComment(comment, 'thread-1234', 'user-1234', 'comment-1234');
            const addedReply = await replyRepositoryPostgres.addReplyComment(reply, 'comment-1234', 'user-1235','1');
            return expect(replyRepositoryPostgres.findReplyById(addedReply.id)).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('verifyReplyOwner function', () => {
        it('should throw AuthorizationError when have not authorization about reply', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
            return expect(replyRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1234')).rejects.toThrowError(AuthorizationError);
        });

        it('should not throw AuthorizationError when have authorization about reply', async () => {
            await UsersTableTestHelper.addUser(user1);
            await UsersTableTestHelper.addUser(user2);

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };
            await ThreadsTableTestHelper.addComment(comment, 'thread-1234', 'user-1234', 'comment-1234');
            await ThreadsTableTestHelper.addReplyComment(comment, 'comment-1234', 'user-1235', 'reply-1234');
            return expect(replyRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1235')).resolves.not.toThrowError(AuthorizationError);
        });
    });

    describe('deleteReplies function', () => {
        it('should throw NotFoundError when replies not found', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            return expect(replyRepositoryPostgres.deleteReply('replies-12345')).rejects.toThrowError(NotFoundError);
        });

        it('should update delete status comment reply correctly', async () => {
            await UsersTableTestHelper.addUser(user1);
            await UsersTableTestHelper.addUser(user2);

            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

            const message = {
                content: 'this is comment'
            };
            await ThreadsTableTestHelper.addComment(message, 'thread-1234', 'user-1234', 'comment-1234');

            const content = {
                content: 'this is comment reply'
            };
            await ThreadsTableTestHelper.addReplyComment(content, 'comment-1234', 'user-1235', 'reply-1234');
            await replyRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1235');

            const deleteReply = await replyRepositoryPostgres.deleteReply('reply-1234', 'comment-1234');
            const deletedReply = await ThreadsTableTestHelper.findReplyById('reply-1234')
            //assert
            expect(deleteReply.id).toStrictEqual('reply-1234');
            expect(deleteReply.content).toStrictEqual(content.content);
            expect(deleteReply.owner).toStrictEqual('user-1235');
            expect(deleteReply.is_deleted).toStrictEqual(true);
            expect(deleteReply.date).not.toBeNaN();

            expect(deletedReply.id).toStrictEqual('reply-1234');
            expect(deletedReply.content).toStrictEqual(content.content);
            expect(deletedReply.username).toStrictEqual('dicoding2');
            expect(deletedReply.is_deleted).toStrictEqual(true);
            expect(deletedReply.date).not.toBeNaN();
        });
    });
});
