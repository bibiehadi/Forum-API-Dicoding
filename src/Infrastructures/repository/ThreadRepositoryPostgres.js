const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const DetailThread = require('../../Domains/threads/entities/DetailThread');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(addThread, userId) {
    const { title, body } = addThread;
    const id = `thread-${this._idGenerator()}`;

    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5, $5) RETURNING id, title, owner, created_at',
      values: [id, title, body, userId, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedThread(result.rows[0]);
  }

  async findThreadById(id) {
    const query = {
      text: 'SELECT threads.id, threads.title, threads.body, threads.created_at AS date, users.username FROM threads LEFT JOIN users ON threads.owner = users.id WHERE threads.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      console.log(new DetailThread({ ...result.rows[0] }));
      return new DetailThread({ ...result.rows[0] });
    }

    throw new NotFoundError('Thread tidak dapat ditemukan');
  }
}

module.exports = ThreadRepositoryPostgres;
