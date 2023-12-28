const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const AddedThread = require('../../Domains/threads/entities/thread/AddedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');
const DetailThread = require('../../Domains/threads/entities/thread/DetailThread');
const CommentThread = require('../../Domains/threads/entities/comment/CommentThread');
const ReplyThread = require('../../Domains/threads/entities/comment/ReplyThread');
const AddedComment = require('../../Domains/threads/entities/comment/AddedCommentThread');

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
    if (!result.rowCount) throw new NotFoundError('Thread tidak dapat ditemukan');
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
      text: `SELECT comments.id, comments.content, users.username, comments.created_at AS date, comments.is_deleted 
             FROM comments LEFT JOIN users ON comments.owner = users.id 
             WHERE comments.thread_id = $1
             ORDER BY comments.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);
    return result.rows.map((comment) => new CommentThread(comment));
  }

  async findCommentById(id) {
    const query = {
      text: 'SELECT comments.id, comments.content, users.username, comments.updated_at AS date, comments.is_deleted FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Comment tidak dapat ditemukan');
    return result.rows[0];
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: 'SELECT * FROM comments WHERE id = $1 AND owner = $2',
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new AuthorizationError('Anda tidak memiliki hak akses terhadap komentar ini');
  }

  async deleteComment(commentId, threadId) {
    const content = '**komentar telah dihapus**';
    const updated_at = new Date().toISOString();
    const query = {
      text: `UPDATE comments SET is_deleted = true, updated_at = $1
            WHERE thread_id = $2 AND id = $3
            RETURNING id, content, owner, is_deleted, updated_at AS date`,
      values: [updated_at, threadId, commentId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus komen, id tidak ditemukan');
    }
    return result.rows[0];
  }

  async addReplyComment(addReply, commentId, owner, replyId = '') {
    const { content } = addReply;
    const id = `reply-${this._idGenerator()}${replyId}`;
    const createdAt = new Date().toISOString();
    const query = {
      text: `INSERT INTO COMMENT_REPLIES VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id, content, owner`,
      values: [id, content, owner, commentId, false, createdAt],
    };

    const result = await this._pool.query(query);
    return new AddedComment(result.rows[0]);
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
      text: 'SELECT reply.id, reply.content, users.username, reply.updated_at AS date , reply.is_deleted FROM comment_replies AS reply LEFT JOIN users ON reply.owner = users.id WHERE reply.id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) throw new NotFoundError('Balasan komentar tidak dapat ditemukan');
    return result.rows[0];
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

module.exports = ThreadRepositoryPostgres;
