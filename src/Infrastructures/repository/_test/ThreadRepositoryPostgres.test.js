const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const AddedCommentThread = require('../../../Domains/threads/entities/AddedCommentThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should add thread to database', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-1234', username: 'dicoding' });

      const fakeIdGenerator = () => '1234';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);
      const addThread = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });

      const addedThread = await threadRepositoryPostgres.addThread(addThread, 'user-1234');

      expect(addedThread).toStrictEqual(new AddedThread({
        id: 'thread-1234',
        title: addThread.title,
        owner: 'user-1234',
      }));
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

      await threadRepositoryPostgres.verifyCommentOwner('comment-1234', 'user-1234');

      const comment = await threadRepositoryPostgres.deleteComment('comment-1234', 'thread-1234');

      expect(comment.id).toEqual(comment.id);
      expect(comment.content).toEqual('**komentar telah dihapus**');
      expect(comment.owner).toEqual(comment.owner);
      expect(comment.is_deleted).toEqual(true);
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
});
