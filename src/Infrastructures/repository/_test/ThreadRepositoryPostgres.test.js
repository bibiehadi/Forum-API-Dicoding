const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/thread/AddThread');
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
      const payload = new AddThread({
        title: 'dicoding',
        body: 'dicoding body thread',
      });
      const addThread = await threadRepositoryPostgres.addThread(payload, userId);
      const addedThread = await threadRepositoryPostgres.getThreadById(threadId);
      //assert
      expect(addThread.id).toStrictEqual(threadId);
      expect(addThread.title).toStrictEqual(payload.title);
      expect(addThread.owner).toStrictEqual(userId);

      expect(addedThread.id).toStrictEqual(threadId);
      expect(addedThread.title).toStrictEqual(payload.title);
      expect(addedThread.body).toStrictEqual(payload.body);
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
});
