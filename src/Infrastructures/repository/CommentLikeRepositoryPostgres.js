const CommentLikeRepository = require('../../Domains/threads/CommentLikeRepository');

class CommentLikeRepositoryPostgres extends CommentLikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addCommentLike(commentId, userId) {
    const id = `like-${this._idGenerator()}`;
    const query = {
      text: 'INSERT INTO COMMENT_LIKES VALUES ($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    };

    const result = await this._pool.query(query);
    return result.rows[0].id;
  }

  async findCommentLikeId(commentId, userId) {
    const query = {
      text: 'SELECT id FROM comment_likes WHERE comment_id = $1 AND liker = $2',
      values: [commentId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rowCount) return null;
    return result.rows[0].id;
  }

  async deleteCommentLikeById(id) {
    const query = {
      text: 'DELETE FROM comment_likes WHERE id = $1',
      values: [id],
    };
    await this._pool.query(query);
  }
}

module.exports = CommentLikeRepositoryPostgres;
