const pool = require('../src/Infrastructures/database/postgres/pool');
const AddedThread = require('../src/Domains/threads/entities/AddedThread');

const ThreadsTableTestHelper = {
  async addThread({
    id, title, body,
  }, owner) {
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO threads VALUES ($1, $2, $3, $4, $5, $5) RETURNING id, title, owner, created_at',
      values: [id, title, body, owner, createdAt],
    };

    const result = await pool.query(query);
    return new AddedThread(result.rows[0]);
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
