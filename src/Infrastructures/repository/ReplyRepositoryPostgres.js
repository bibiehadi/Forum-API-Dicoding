const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const ReplyRepository = require('../../Domains/threads/ReplyRepository');
const CommentThread = require('../../Domains/threads/entities/comment/CommentThread');
const AddedCommentThread = require('../../Domains/threads/entities/comment/AddedCommentThread');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReplyComment(addReply, commentId, owner) {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO COMMENT_REPLIES VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id, content, owner',
      values: [id, content, owner, commentId, false, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedCommentThread(result.rows[0]);
  }

  async getRepliesByThread(threadId) {
    const query = {
      text: `SELECT reply.id, reply.content, users.username, reply.created_at AS date, reply.comment_id, reply.is_deleted 
                FROM comment_replies AS reply 
                LEFT JOIN users ON reply.owner = users.id
                LEFT JOIN comments ON reply.comment_id = comments.id
             WHERE comments.thread_id = $1 ORDER BY reply.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  async findReplyById(id) {
    const query = {
      text: 'SELECT * FROM comment_replies AS reply WHERE reply.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Balasan reply tidak dapat ditemukan');
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: 'SELECT * FROM comment_replies WHERE id = $1 AND owner = $2',
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new AuthorizationError('Anda tidak memiliki hak akses terhadap balasan komentar ini');
  }

  async deleteReply(replyId, commentId) {
    const updated_at = new Date().toISOString();
    const query = {
      text: `UPDATE comment_replies SET is_deleted = true, updated_at = $1
            WHERE comment_id = $2 AND id = $3
            RETURNING id, content, owner, is_deleted, updated_at AS date`,
      values: [updated_at, commentId, replyId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus balasan komentar, id tidak ditemukan');
    }
    return result.rows[0];
  }
}

module.exports = ReplyRepositoryPostgres;
