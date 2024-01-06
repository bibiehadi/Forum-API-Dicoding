const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/thread/AddThread');
const CommentThread = require('../../../Domains/threads/entities/comment/CommentThread');
const ReplyThread = require('../../../Domains/threads/entities/comment/ReplyThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const InvariantError = require("../../../Commons/exceptions/InvariantError");
const {add} = require("nodemon/lib/rules");

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
      await threadRepositoryPostgres.addThread(addThread, userId);
      const addedThread = await threadRepositoryPostgres.getThreadById(threadId);
      //assert
      expect(addedThread.id).toStrictEqual(threadId);
      expect(addedThread.title).toStrictEqual(addThread.title);
      expect(addedThread.body).toStrictEqual(addThread.body);
      expect(new Date(addedThread.date).getMinutes()).toStrictEqual(new Date().getMinutes());
      expect(addedThread.username).toStrictEqual('dicoding');
    });
  });

  describe('findThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.findThreadById('thread-XXXX')).rejects.toThrowError(NotFoundError);
    });

    it('should return detailThread correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const fakeIdGenerator = () => '1234';

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedTread = await threadRepositoryPostgres.addThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      }, 'user-1234');

      return expect(threadRepositoryPostgres.findThreadById(addedTread.id)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.getThreadById('thread-XXXX')).rejects.toThrowError(NotFoundError);
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
      await threadRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');
      const addedCommentThread = await threadRepositoryPostgres.getCommentById('comment-1234');
      expect(addedCommentThread.id).toStrictEqual('comment-1234');
      expect(addedCommentThread.content).toStrictEqual(comment.content);
      expect(addedCommentThread.username).toStrictEqual('dicoding');
      expect(addedCommentThread.date).not.toBeNull();
      expect(addedCommentThread.is_deleted).toStrictEqual(false);
    });
  });

  describe('findCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.findCommentById('comment-xxxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return list of comment when comments are found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
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

      const addedComment = await threadRepositoryPostgres.addComment(content, 'thread-1234', 'user-1234', '1');
      return expect(threadRepositoryPostgres.findCommentById(addedComment.id)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsThreads function', () => {
    it('should return empty array when no comment are found in thread', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const comments = await threadRepositoryPostgres.getCommentsByThread();
      expect(comments).toHaveLength(0);
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
      expect(comments[0].replies).toHaveLength(0);

      expect(comments[1].id).toEqual(addedComment2.id);
      expect(comments[1].content).toStrictEqual(addedComment2.content);
      expect(comments[1].username).toStrictEqual('dicoding2');
      expect(new Date(comments[1].date).getMinutes()).toStrictEqual(created_at);
      expect(comments[1].replies).toHaveLength(0);
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
      await threadRepositoryPostgres.deleteComment('comment-1234', 'thread-1234');
      const deletedComment = await threadRepositoryPostgres.getCommentById('comment-1234');
      // assert
      expect(deletedComment.id).toStrictEqual('comment-1234');
      expect(deletedComment.content).toStrictEqual(message.content);
      expect(deletedComment.username).toStrictEqual('dicoding');
      expect(deletedComment.is_deleted).toStrictEqual(true);
      expect(deletedComment.date).not.toBeNull();
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

      return expect(threadRepositoryPostgres.getCommentById('comment-1234')).rejects.toThrowError(NotFoundError);
    });
  });

  describe('getRepliesComment function', () => {
    it('should return empty array when no comment are found in thread', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const replies = await threadRepositoryPostgres.getRepliesByThread();
      expect(replies).toHaveLength(0);
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

  describe('addRepliesComment function', () => {
    it('should return empty array when no comment are found in thread', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const replies = await threadRepositoryPostgres.getRepliesByThread();
      expect(replies).toHaveLength(0);
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

  describe('findReplyById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      return expect(threadRepositoryPostgres.findReplyById('reply-xxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return a reply where founded', async () => {
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
      const addedReply = await threadRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
      return expect(threadRepositoryPostgres.findReplyById(addedReply.id)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getReplyById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
      return expect(threadRepositoryPostgres.getReplyById('reply-xxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return a reply where founded', async () => {
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
      await threadRepositoryPostgres.addReplyComment(reply, 'comment-12341', 'user-1235','1');
      const addedReply = await threadRepositoryPostgres.getReplyById('reply-12341');
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
      await threadRepositoryPostgres.verifyReplyOwner('reply-1234', 'user-1235');

      await threadRepositoryPostgres.deleteReply('reply-1234', 'comment-1234');
      const deletedReply = await threadRepositoryPostgres.getReplyById('reply-1234')

      //assert
      expect(deletedReply.id).toStrictEqual('reply-1234');
      expect(deletedReply.content).toStrictEqual(content.content);
      expect(deletedReply.username).toStrictEqual('dicoding2');
      expect(deletedReply.is_deleted).toStrictEqual(true);
      expect(deletedReply.date).not.toBeNaN();
    });
  });
});
