const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedThread = require('../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const DetailThread = require('../../Domains/threads/entities/DetailThread');
const CommentThread = require('../../Domains/threads/entities/CommentThread');
const AddedComment = require('../../Domains/threads/entities/AddedCommentThread');

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
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Thread tidak dapat ditemukan');
    }
    return true;
  }

  async getThreadById(id) {
    const query = {
      text: 'SELECT threads.id, threads.title, threads.body, threads.created_at AS date, users.username FROM threads LEFT JOIN users ON threads.owner = users.id WHERE threads.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      return new DetailThread({ ...result.rows[0] });
    }

    throw new NotFoundError('Thread tidak dapat ditemukan');
  }

  async addComment(addComment, threadId, owner, commentId = '') {
    const { content } = addComment;
    const id = `comment-${this._idGenerator()}${commentId}`;
    const createdAt = new Date().toISOString();
    const query = {
      text: 'INSERT INTO COMMENTS VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id, content, owner',
      values: [id, content, owner, threadId, false, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
  }

  async getCommentsByThread(threadId) {
    const query = {
      text: 'SELECT comments.id, comments.content, users.username, comments.created_at AS date FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.thread_id = $1',
      values: [threadId],
    };

    const result = await this._pool.query(query);
    if (result.rowCount <= 0) return [];
    return result.rows;
    // return result.rows.map((comment) => new CommentThread(...comment));
  }

  async findCommentById(id) {
    const query = {
      text: 'SELECT comments.id, comments.content, users.username, comments.created_at AS date FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Thread tidak dapat ditemukan');
    // return new CommentThread({ ...result.rows[0] });
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new AuthorizationError('Anda tidak memiliki hak akses terhadap komentar ini');
    return true;
  }

  async deleteComment(commentId, threadId) {
    const deletedComment = '**komentar telah dihapus**';
    const query = {
      text: `UPDATE comments SET is_deleted = true, content = $1 
            WHERE thread_id = $2 AND id = $3 
            RETURNING id, content, owner, is_deleted`,
      values: [deletedComment, threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Album update failed, id not found');
    }
    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
