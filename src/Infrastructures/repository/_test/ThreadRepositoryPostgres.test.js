const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/thread/AddThread');
const AddedThread = require('../../../Domains/threads/entities/thread/AddedThread');
const AddedCommentThread = require('../../../Domains/threads/entities/comment/AddedCommentThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

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

      expect(addedThread).toStrictEqual(new AddedThread({
        id: threadId,
        title: addThread.title,
        owner: userId,
      }));

      expect(addedThread.id).toEqual(threadId);
      expect(addedThread.title).toEqual(addThread.title);
      expect(addedThread.owner).toEqual(userId);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.findThreadById('thread-1234')).rejects.toThrowError(NotFoundError);
    });

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

      expect(addedCommentThread).toStrictEqual(new AddedCommentThread({
        id: 'comment-1234',
        content: 'this is comment',
        owner: 'user-1234',
      }));

      expect(addedCommentThread.id).toEqual('comment-1234');
      expect(addedCommentThread.content).toEqual(comment.content);
      expect(addedCommentThread.owner).toEqual('user-1234');
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

      const comment = {
        content: 'this is comment'
      };
      const comment2 = {
        content: 'this is comment2'
      };
      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');

      await threadRepositoryPostgres.addComment(comment2, 'thread-1234', 'user-1235', '2');

      const comments = await threadRepositoryPostgres.getCommentsByThread('thread-1234');
      expect(comments).toHaveLength(2);
      expect(comments[0].id).toEqual('comment-12341');
      expect(comments[0].content).toEqual(comment.content);
      expect(comments[0].username).toEqual('dicoding');

      expect(comments[1].id).toEqual('comment-12342');
      expect(comments[1].content).toEqual(comment2.content);
      expect(comments[1].username).toEqual('dicoding2');
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
      await threadRepositoryPostgres.findCommentById('comment-1234');
      await threadRepositoryPostgres.verifyCommentOwner('comment-1234', 'user-1234');
      const updated_at = new Date().getMinutes();
      const deletedComment = await threadRepositoryPostgres.deleteComment('comment-1234', 'thread-1234');
      expect(deletedComment.id).toEqual('comment-1234');
      expect(deletedComment.is_deleted).toBe(true);
      expect(new Date(deletedComment.date).getMinutes()).toEqual(updated_at);
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
      const addedCommentThread = await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');

      const replyComment = {
        content : 'this is comment' };
      const addReplyComment = await threadRepositoryPostgres.addReplyComment(comment, 'comment-1234', 'user-12345');

      expect(addedCommentThread).toStrictEqual(new AddedCommentThread({
        id: 'comment-1234',
        content: 'this is comment',
        owner: 'user-1234',
      }));

      expect(addedCommentThread.id).toEqual('comment-1234');
      expect(addedCommentThread.content).toEqual(comment.content);
      expect(addedCommentThread.owner).toEqual('user-1234');
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
      //
      // const reply2 = {
      //   content: 'yes that is second comment',
      // }

      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234', '1');

      await threadRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
      // await threadRepositoryPostgres.addReplyComment(reply2, 'comment-12341', 'user-1234','2');
      const replies = await threadRepositoryPostgres.getRepliesByThread('thread-1234');
      expect(replies).toHaveLength(1);

      expect(replies[0].id).toEqual('reply-12341');
      expect(replies[0].content).toEqual(reply.content);
      expect(replies[0].username).toEqual('dicoding2');
      //
      // expect(replies[1].id).toEqual('reply-12342');
      // expect(replies[1].content).toEqual(reply2.content);
      // expect(replies[1].username).toEqual('dicoding');
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
      const reply = await threadRepositoryPostgres.addReplyComment(content, 'comment-1234', 'user-1235');
      await threadRepositoryPostgres.findReplyById('reply-1234')
      await threadRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1235');

      const updated_at = new Date().getMinutes();
      const deletedReply = await threadRepositoryPostgres.deleteReply(reply.id, 'comment-1234');

      expect(deletedReply.id).toEqual(deletedReply.id);
      expect(deletedReply.is_deleted).toBe(true);
      expect(new Date(deletedReply.date).getMinutes()).toEqual(updated_at);
    });
  });
});
