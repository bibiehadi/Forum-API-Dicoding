class CommentThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, username, content, date, replies,
    } = payload;

    this.id = id;
    this.content = content;
    this.username = username;
    this.date = date;
    this.replies = replies;
  }

  _verifyPayload({
    id, content, username, date, replies,
  }) {
    if (!id || !content || !username || !date) {
      throw new Error('COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof id !== 'string' || typeof content !== 'string' || typeof username !== 'string' || typeof date !== 'string') {
      throw new Error('COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CommentThread;
