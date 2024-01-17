const pool = require('../src/Infrastructures/database/postgres/pool');
const AddedThread = require('../src/Domains/threads/entities/thread/AddedThread');
const AddedComment = require("../src/Domains/threads/entities/comment/AddedCommentThread");
const NotFoundError = require("../src/Commons/exceptions/NotFoundError");

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

  async addComment(content, threadId, userId, commentId) {
    const id = commentId;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO comments VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id, content, owner',
      values: [id, content, userId, threadId, false, createdAt],
    };

    const result = await pool.query(query);
    return new AddedComment(result.rows[0]);
  },

  async getCommentById(id) {
    const query = {
      text: 'SELECT comments.id, comments.content, users.username, comments.updated_at as DATE, comments.is_deleted FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Comment tidak dapat ditemukan');
    return result.rows[0];
  },

  async addReplyComment(addReply, commentId, owner, replyId) {
    const { content } = addReply;
    const createdAt = new Date().toISOString();
    const query = {
      text: `INSERT INTO comment_replies VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id, content, owner`,
      values: [replyId, content, owner, commentId, false, createdAt],
    };

    const result = await pool.query(query);
    return new AddedComment(result.rows[0]);
  },

  async getReplyById(id) {
    const query = {
      text: 'SELECT reply.id, reply.content, users.username, reply.updated_at AS date, reply.is_deleted, reply.comment_id FROM comment_replies AS reply LEFT JOIN users ON reply.owner = users.id WHERE reply.id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Balasan komentar tidak dapat ditemukan');
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('DELETE FROM threads WHERE 1=1');
  },
};

module.exports = ThreadsTableTestHelper;
