const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const CommentRepository = require('../../Domains/threads/CommentRepository');
const CommentThread = require('../../Domains/threads/entities/comment/CommentThread');
const AddedCommentThread = require('../../Domains/threads/entities/comment/AddedCommentThread');

class CommentRepositoryPostgres extends CommentRepository {
    constructor(pool, idGenerator) {
        super();
        this._pool = pool;
        this._idGenerator = idGenerator;
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
        return new AddedCommentThread(result.rows[0]);
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
    }

    async getCommentById(id) {
        const query = {
            text: 'SELECT comments.id, comments.content, users.username, comments.updated_at as DATE, comments.is_deleted FROM comments LEFT JOIN users ON comments.owner = users.id WHERE comments.id = $1',
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
}

module.exports = CommentRepositoryPostgres;
