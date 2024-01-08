const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/thread/AddThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('CommentRepository postgres', () => {
    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    describe('getRepliesComment function', () => {
        it('should return empty array when no comment are found in thread', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            const replies = await replyRepositoryPostgres.getRepliesByThread();
            expect(replies).toHaveLength(0);
        });

        it('should return list of comment when replies are found', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');
            const created_at = new Date().getMinutes();
            await replyRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
            // await threadRepositoryPostgres.addReplyComment(reply2, 'comment-12341', 'user-1234','2');
            const replies = await replyRepositoryPostgres.getRepliesByThread('thread-1234');
            expect(replies[0].id).toEqual('reply-12341');
            expect(replies[0].content).toEqual(reply.content);
            expect(replies[0].username).toEqual('dicoding2');

            expect(new Date(replies[0].date).getMinutes()).toBe(created_at);
            expect(replies[0].comment_id).toEqual('comment-12341');
            expect(replies[0].is_deleted).toEqual(false);
        });
    });

    describe('addRepliesComment function', () => {
        it('should return empty array when no comment are found in thread', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            const replies = await replyRepositoryPostgres.getRepliesByThread();
            expect(replies).toHaveLength(0);
        });

        it('should return list of comment when replies are found', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');
            const created_at = new Date().getMinutes();
            await replyRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
            const replies = await replyRepositoryPostgres.getRepliesByThread('thread-1234');
            expect(replies[0].id).toEqual('reply-12341');
            expect(replies[0].content).toEqual(reply.content);
            expect(replies[0].username).toEqual('dicoding2');

            expect(new Date(replies[0].date).getMinutes()).toBe(created_at);
            expect(replies[0].comment_id).toEqual('comment-12341');
            expect(replies[0].is_deleted).toEqual(false);
        });
    });

    describe('findReplyById function', () => {
        it('should throw NotFoundError when thread not found', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            return expect(replyRepositoryPostgres.findReplyById('reply-xxxx')).rejects.toThrowError(NotFoundError);
        });

        it('should return a reply where founded', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);


            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');
            const addedReply = await replyRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
            return expect(replyRepositoryPostgres.findReplyById(addedReply.id)).resolves.not.toThrowError(NotFoundError);
        });
    });

    describe('getReplyById function', () => {
        it('should throw NotFoundError when thread not found', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});
            return expect(replyRepositoryPostgres.getReplyById('reply-xxxx')).rejects.toThrowError(NotFoundError);
        });

        it('should return a reply where founded', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);


            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };

            const reply = {
                content: 'yes that is first comment',
            }

            await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');
            await replyRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
            const addedReply = await replyRepositoryPostgres.getReplyById('reply-12341');
            expect(addedReply.id).toEqual('reply-12341');
            expect(addedReply.content).toEqual(reply.content);
            expect(addedReply.username).toEqual('dicoding2');
            expect(addedReply.is_deleted).toEqual(false);
            expect(addedReply.comment_id).toEqual('comment-12341');
            expect(addedReply.date).not.toBeNull();

        });
    });

    describe('deleteReplies function', () => {
        it('should throw NotFoundError when replies not found', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, {});

            return expect(replyRepositoryPostgres.deleteReply('replies-12345')).rejects.toThrowError(NotFoundError);
        });

        it('should throw AuthorizationError when have not authorization about reply', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });

            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);


            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const comment = {
                content: 'this is comment'
            };
            await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');

            const reply = {
                content: 'this is comment reply'
            };
            await replyRepositoryPostgres.addReplyComment(comment, 'comment-1234', 'user-1235');

            return expect(replyRepositoryPostgres.verifyReplyOwner('comment-1234', 'user-1234')).rejects.toThrowError(AuthorizationError);
        });

        it('should update delete status comment when comment not found', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const message = {
                content: 'this is comment'
            };

            return expect(replyRepositoryPostgres.findReplyById('comment-1234')).rejects.toThrowError(NotFoundError);
        });

        it('should update delete status comment reply correctly', async () => {
            await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
            await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });

            const fakeIdGenerator = () => '1234';
            const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
            const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(pool, fakeIdGenerator);

            const addThread = new AddThread({
                title: 'dicoding',
                body: 'dicoding body thread',
            });

            await threadRepositoryPostgres.addThread(addThread, 'user-1234');

            const message = {
                content: 'this is comment'
            };
            await commentRepositoryPostgres.addComment(message, 'thread-1234', 'user-1234');

            const content = {
                content: 'this is comment reply'
            };
            await replyRepositoryPostgres.addReplyComment(content, 'comment-1234', 'user-1235');
            await replyRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1235');

            await replyRepositoryPostgres.deleteReply('reply-1234', 'comment-1234');
            const deletedReply = await replyRepositoryPostgres.getReplyById('reply-1234')

            //assert
            expect(deletedReply.id).toStrictEqual('reply-1234');
            expect(deletedReply.content).toStrictEqual(content.content);
            expect(deletedReply.username).toStrictEqual('dicoding2');
            expect(deletedReply.is_deleted).toStrictEqual(true);
            expect(deletedReply.date).not.toBeNaN();
        });
    });
});
