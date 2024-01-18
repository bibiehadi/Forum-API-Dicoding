const {type} = require("@hapi/hapi/lib/headers");

class CommentThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, content, date, likeCount, replies, is_deleted = false
    } = payload;

    this.id = id;
    this.content = (is_deleted) ? '**komentar telah dihapus**' : content;
    this.username = username;
    this.date = date;
    this.likeCount = (likeCount === undefined) ? 0 : likeCount;
    this.replies = (replies === undefined ) ? [] : replies;
  }

  _verifyPayload({
    id, content, username, date, likeCount, replies
  }) {
    replies = (replies === undefined ) ? [] : replies;
    likeCount = (likeCount === undefined ) ? 0 : likeCount;
    if (!id || !content || !username || !date) {
      throw new Error('COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof username !== 'string' || typeof date !== 'string' || typeof likeCount !== 'number' || typeof replies !== 'object') {
      throw new Error('COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentThread;
