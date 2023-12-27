const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/thread/AddThread');
const AddedThread = require('../../../Domains/threads/entities/thread/AddedThread');
const AddedCommentThread = require('../../../Domains/threads/entities/comment/AddedCommentThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const repl = require("repl");

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    const userId = 'user-1234'
    const threadId = 'thread-1234'
    it('should add thread to database', async () => {
      await UsersTableTestHelper.addUser({ id: userId, username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      const addedThread = await threadRepositoryPostgres.addThread(addThread, userId);
      expect(addedThread).toHaveProperty('id');
      expect(addedThread).toStrictEqual(new AddedThread({
        id: threadId,
        title: addThread.title,
        owner: userId,
      }));
      expect(addedThread.id).toStrictEqual(threadId);
      expect(addedThread.title).toStrictEqual(addThread.title);
      expect(addedThread.owner).toStrictEqual(userId);
    });
  });

  describe('findThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.findThreadById('thread-1234')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.getThreadById('thread-1234')).rejects.toThrowError(NotFoundError);
    });

    it('should return detailThread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const fakeIdGenerator = () => '1234';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedTread = await threadRepositoryPostgres.addThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      }, 'user-1234');

      const thread = await threadRepositoryPostgres.getThreadById('thread-1234');
      expect(thread.id).toEqual(addedTread.id);
      expect(thread.title).toEqual(addedTread.title);
      expect(thread.body).toEqual('dicoding body thread');
      expect(thread.username).toEqual('dicoding');
      expect(thread.comments).toEqual([]);
    });
  });

  describe('addCommentThread function', () => {
    it('should add comment thread to database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const comment = {
        content : 'this is comment' };
      const addedCommentThread = await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');
      expect(addedCommentThread).toHaveProperty('id')
      expect(addedCommentThread).toStrictEqual(new AddedCommentThread({
        id: 'comment-1234',
        content: 'this is comment',
        owner: 'user-1234',
      }));

      expect(addedCommentThread.id).toStrictEqual('comment-1234');
      expect(addedCommentThread.content).toStrictEqual(comment.content);
      expect(addedCommentThread.owner).toStrictEqual('user-1234');
    });
  });

  describe('getCommentsThreads function', () => {
    it('should return empty array when no comment are found in thread', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const comments = await threadRepositoryPostgres.getCommentsByThread();
      expect(comments).toEqual([]);
    });

    it('should return list of comment when comments are found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const content = {
        content: 'this is comment'
      };
      const content2 = {
        content: 'this is comment2'
      };
      const created_at = new Date().getMinutes();
      const addedComment = await threadRepositoryPostgres.addComment(content, 'thread-1234', 'user-1234', '1');
      const addedComment2 = await threadRepositoryPostgres.addComment(content2, 'thread-1234', 'user-1235', '2');

      const comments = await threadRepositoryPostgres.getCommentsByThread('thread-1234');
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual(addedComment.id);
      expect(comments[0].content).toStrictEqual(addedComment.content);
      expect(comments[0].username).toStrictEqual('dicoding');
      expect(new Date(comments[0].date).getMinutes()).toStrictEqual(created_at);
      expect(comments[0].replies).toStrictEqual([]);

      expect(comments[1].id).toEqual(addedComment2.id);
      expect(comments[1].content).toStrictEqual(addedComment2.content);
      expect(comments[1].username).toStrictEqual('dicoding2');
      expect(new Date(comments[1].date).getMinutes()).toStrictEqual(created_at);
      expect(comments[1].replies).toStrictEqual([]);
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.deleteComment('comment-12345')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when have not authorization about comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const comment = {
        content: 'this is comment'
      };
      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');

      return expect(threadRepositoryPostgres.verifyCommentOwner('thread-1234', 'user-12344')).rejects.toThrowError(AuthorizationError);
    });

    it('should update delete status comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment'
      };
      await threadRepositoryPostgres.addComment(message, 'thread-1234', 'user-1234');
      const comment = await threadRepositoryPostgres.findCommentById('comment-1234');
      const date = new Date().getSeconds();
      await threadRepositoryPostgres.verifyCommentOwner('comment-1234', 'user-1234');
      const deletedComment = await threadRepositoryPostgres.deleteComment('comment-1234', 'thread-1234');

      // assert
      expect(deletedComment.id).toEqual('comment-1234');
      expect(deletedComment.is_deleted).not.toEqual(comment.is_deleted);
      expect(deletedComment.is_deleted).toEqual(true);
      expect(new Date(deletedComment.date).getTime()).not.toBe(new Date(comment.date).getTime());
      expect(new Date(deletedComment.date).getSeconds()).toEqual(date);
    });

    it('should update delete status comment correctly with wrong user', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment'
      };
      await threadRepositoryPostgres.addComment(message, 'thread-1234', 'user-1234');

      return expect(threadRepositoryPostgres.verifyCommentOwner('comment-1234', 'user-12345')).rejects.toThrowError(AuthorizationError);
    });

    it('should update delete status comment when comment not found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment'
      };

      return expect(threadRepositoryPostgres.findCommentById('comment-1234')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('addReplyComment function', () => {
    it('should add reply comment to database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-12345', username: 'dicoding2' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const comment = {
        content : 'this is comment' };
      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');

      const replyComment = {
        content : 'this is reply' };
      const addReplyComment = await threadRepositoryPostgres.addReplyComment(replyComment, 'comment-1234', 'user-12345');
      expect(addReplyComment).toHaveProperty('id');
      expect(addReplyComment).toStrictEqual(new AddedCommentThread({
        id: 'reply-1234',
        content: 'this is reply',
        owner: 'user-12345',
      }));
      expect(addReplyComment.id).toStrictEqual('reply-1234');
      expect(addReplyComment.content).toStrictEqual(replyComment.content);
      expect(addReplyComment.owner).toStrictEqual('user-12345');
    });
  });

  describe('getRepliesComment function', () => {
    it('should return empty array when no comment are found in thread', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const comments = await threadRepositoryPostgres.getRepliesByThread();
      expect(comments).toEqual([]);
    });

    it('should return list of comment when replies are found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

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

      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');
      const created_at = new Date().getMinutes();
      await threadRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
      // await threadRepositoryPostgres.addReplyComment(reply2, 'comment-12341', 'user-1234','2');
      const replies = await threadRepositoryPostgres.getRepliesByThread('thread-1234');
      expect(replies).toHaveLength(1);
      expect(replies[0].id).toEqual('reply-12341');
      expect(replies[0].content).toEqual(reply.content);
      expect(replies[0].username).toEqual('dicoding2');

      expect(new Date(replies[0].date).getMinutes()).toBe(created_at);
      expect(replies[0].comment_id).toEqual('comment-12341');
      expect(replies[0].is_deleted).toEqual(false);
    });
  });

  describe('deleteReplies function', () => {
    it('should throw NotFoundError when replies not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.deleteReply('replies-12345')).rejects.toThrowError(NotFoundError);
    });

    it('should throw AuthorizationError when have not authorization about reply', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const comment = {
        content: 'this is comment'
      };
      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');

      const reply = {
        content: 'this is comment reply'
      };
      await threadRepositoryPostgres.addReplyComment(comment, 'comment-1234', 'user-1235');

      return expect(threadRepositoryPostgres.verifyReplyOwner('comment-1234', 'user-1234')).rejects.toThrowError(AuthorizationError);
    });

    it('should update delete status comment when comment not found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment'
      };

      return expect(threadRepositoryPostgres.findReplyById('comment-1234')).rejects.toThrowError(NotFoundError);
    });

    it('should update delete status comment reply correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment'
      };
      await threadRepositoryPostgres.addComment(message, 'thread-1234', 'user-1234');

      const content = {
        content: 'this is comment reply'
      };
      await threadRepositoryPostgres.addReplyComment(content, 'comment-1234', 'user-1235');
      const replied = await threadRepositoryPostgres.findReplyById('reply-1234');
      await threadRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1235');

      const date = new Date().getSeconds();
      const deletedReply = await threadRepositoryPostgres.deleteReply(replied.id, 'comment-1234');

      expect(deletedReply.id).toEqual(deletedReply.id);
      expect(deletedReply.is_deleted).not.toBe(replied.is_deleted);
      expect(deletedReply.is_deleted).toEqual(true);
      expect(new Date(deletedReply.date).getTime()).not.toBe(new Date(replied.date).getTime());
      expect(new Date(deletedReply.date).getSeconds()).toEqual(date);
    });
  });
});
