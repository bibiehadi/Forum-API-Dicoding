class ReplyThread {
    constructor(payload) {
        this._verifyPayload(payload);

        const {
            id, username, content, date, replies, is_deleted = false
        } = payload;

        this.id = id;
        this.content = (is_deleted) ? '**balasan telah dihapus**' : content;
        this.username = username;
        this.date = date;
        this.replies = replies;
    }

    _verifyPayload({id, content, username, date, replies}) {
        if (!id || !content || !username || !date) {
            throw new Error('REPLY_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (typeof id !== 'string' || typeof content !== 'string' || typeof username !== 'string' || typeof date !== 'string') {
            throw new Error('REPLY_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = ReplyThread;
