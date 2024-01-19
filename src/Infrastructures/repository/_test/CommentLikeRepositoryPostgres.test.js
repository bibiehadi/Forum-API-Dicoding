const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const pool = require('../../database/postgres/pool');
const CommentLikeRepositoryPostgres = require('../CommentLikeRepositoryPostgres');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');

describe('CommentRepository postgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addCommentLike function', () => {
    it('should add comment thread to database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const comment = { content: 'this is comment' };
      await ThreadsTableTestHelper.addComment(comment, 'thread-1234', 'user-1234', 'comment-1234');
      const result = await commentLikeRepositoryPostgres.addCommentLike('comment-1234', 'user-1234');
      const likeCommentId = await commentLikeRepositoryPostgres.findCommentLikeId('comment-1234', 'user-1234');

      expect(likeCommentId).toStrictEqual('like-1234');
    });
  });

  describe('findCommentLikeId function', () => {
    it('should throw NotFoundError when comment like not found', async () => {
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, {});
      const likeId = await commentLikeRepositoryPostgres.findCommentLikeId('like-xxxxx', 'user-xxxx ');
      return expect(likeId).toBeNull();
    });

    it('should return commentLikeId when comments like are found', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });
      const fakeIdGenerator = () => '1234';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const comment = { content: 'this is comment' };
      await ThreadsTableTestHelper.addComment(comment, 'thread-1234', 'user-1234', 'comment-1234');
      const result = await commentLikeRepositoryPostgres.addCommentLike('comment-1234', 'user-1234');

      return expect(commentLikeRepositoryPostgres.findCommentLikeId('comment-1234', 'user-1234')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('deleteCommentLikeById function', () => {
    it('should update delete status comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const commentLikeRepositoryPostgres = new CommentLikeRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = {
        id: 'thread-1234',
        title: 'dicoding',
        body: 'dicoding body thread',
      };

      await ThreadsTableTestHelper.addThread(addThread, 'user-1234');

      const message = {
        content: 'this is comment',
      };
      await ThreadsTableTestHelper.addComment(message, 'thread-1234', 'user-1234', 'comment-1234');
      const result = await commentLikeRepositoryPostgres.addCommentLike('comment-1234', 'user-1234');
      const deleteCommentLikeById = await commentLikeRepositoryPostgres.deleteCommentLikeById('like-1234');
      // assert

      expect(deleteCommentLikeById).toBeUndefined();
    });
  });
});
