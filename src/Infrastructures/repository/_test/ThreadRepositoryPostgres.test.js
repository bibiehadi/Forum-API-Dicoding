const InvariantError = require('../../../Commons/exceptions/InvariantError');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const pool = require('../../database/postgres/pool');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

describe('ThreadRepository postgres', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
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

  // describe('getThreadById function', () => {
  //   it('should throw InvariantError when thread not found', async () => {
  //     const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});
  //
  //     return expect(threadRepositoryPostgres.getThreadById('thread-1234')).rejects.toThrowError(InvariantError);
  //   });
  //
  //   it('should return detailThread correctly', async () => {
  //     await
  //   });
  // });
});
