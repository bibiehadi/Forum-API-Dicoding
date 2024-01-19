const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentThread function', () => {
    it('should add comment thread to database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const comment = { content: 'this is comment' };
      const addComment = await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');
      const addedCommentThread = await ThreadsTableTestHelper.findCommentById('comment-1234');

      expect(addComment.id).toStrictEqual('comment-1234');
      expect(addComment.content).toStrictEqual(comment.content);
      expect(addComment.owner).toStrictEqual('user-1234');

      expect(addedCommentThread.content).toStrictEqual(comment.content);
      expect(addedCommentThread.username).toStrictEqual('dicoding');
      expect(addedCommentThread.date).not.toBeNull();
      expect(addedCommentThread.is_deleted).toStrictEqual(false);
    });
  });

  describe('findCommentById function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      return expect(commentRepositoryPostgres.findCommentById('comment-xxxxx')).rejects.toThrowError(NotFoundError);
    });

    it('should return list of comment when comments are found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const fakeIdGenerator = () => '1234';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const content = {
        content: 'this is comment',
      };

      const addedComment = await commentRepositoryPostgres.addComment(content, 'thread-1234', 'user-1234', '1');
      return expect(commentRepositoryPostgres.findCommentById(addedComment.id)).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getCommentsThreads function', () => {
    it('should return empty array when no comment are found in thread', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const comments = await commentRepositoryPostgres.getCommentsByThread();
      expect(comments).toHaveLength(0);
    });

    it('should return list of comment when comments are found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      await UsersTableTestHelper.addUser({ id: 'user-1235', username: 'dicoding2' });
      const fakeIdGenerator = () => '1234';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const content = {
        content: 'this is comment',
      };
      const content2 = {
        content: 'this is comment2',
      };
      const created_at = new Date().getMinutes();
      const addedComment = await ThreadsTableTestHelper.addComment(content.content, 'thread-1234', 'user-1234', 'comment-1234');
      const addedComment2 = await ThreadsTableTestHelper.addComment(content2.content, 'thread-1234', 'user-1235', 'comment-1235');

      const comments = await commentRepositoryPostgres.getCommentsByThread('thread-1234');
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

  describe('verifyCommentOwner function', () => {
    it('should throw AuthorizationError when have not authorization about comment', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      return expect(commentRepositoryPostgres.verifyCommentOwner('thread-1234', 'user-12344')).rejects.toThrowError(AuthorizationError);
    });

    it('should not throw AuthorizationError when have authorization about comment', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const comment = {
        content: 'this is comment',
      };
      await commentRepositoryPostgres.addComment(comment, 'thread-1234', 'user-1234');

      return expect(commentRepositoryPostgres.verifyCommentOwner('comment-1234', 'user-1234')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      return expect(commentRepositoryPostgres.deleteComment('comment-12345')).rejects.toThrowError(NotFoundError);
    });

    it('should update delete status comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment',
      };
      await commentRepositoryPostgres.addComment(message, 'thread-1234', 'user-1234');
      const deleteComment = await commentRepositoryPostgres.deleteComment('comment-1234', 'thread-1234');
      const deletedComment = await ThreadsTableTestHelper.findCommentById('comment-1234');
      // assert

      expect(deletedComment.id).toStrictEqual('comment-1234');
      expect(deletedComment.content).toStrictEqual(message.content);
      expect(deletedComment.username).toStrictEqual('dicoding');
      expect(deletedComment.is_deleted).toStrictEqual(true);
      expect(deletedComment.date).not.toBeNull();
    });
  });
});
