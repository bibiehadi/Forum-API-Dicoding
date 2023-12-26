const ReplyThread = require('../ReplyThread');
const CommentThread = require("../CommentThread");

describe('a ReplyThread entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            content: 'reply comment',
            username: 'user-1234',
            date: '2021-08-08T07:59:18.982Z',
        };

        // Action and Assert
        expect(() => new ReplyThread(payload)).toThrowError('REPLY_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    });

    it('should throw error when payload did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 123,
            content: 'dicoding',
            username: {},
            date: 123,
            replies: [],
        };

        // Action and Assert
        expect(() => new ReplyThread(payload)).toThrowError('REPLY_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    });

    it('should create replyThread object correctly', () => {
        // Arrange
        const payload = {
            id: 'reply-1234',
            content: 'reply comment',
            username: 'user-1234',
            date: '2021-08-08T07:59:18.982Z',
            replies: [],
        };

        // Action
        const replyThread = new ReplyThread(payload);

        // Assert
        expect(replyThread.id).toEqual(payload.id);
        expect(replyThread.content).toEqual(payload.content);
        expect(replyThread.username).toEqual(payload.username);
        expect(replyThread.date).toEqual(payload.date);
        expect(replyThread.replies).toEqual(payload.replies);
    });

    it('should create replyThread object correctly if is_deleted is true', () => {
        // Arrange
        const payload = {
            id: 'reply-1234',
            content: 'reply comment',
            username: 'user-1234',
            date: '2021-08-08T07:59:18.982Z',
            replies: [],
            is_deleted: true,
        };

        // Action
        const replyThread = new ReplyThread(payload);

        // Assert
        expect(replyThread.id).toEqual(payload.id);
        expect(replyThread.content).toEqual('**balasan telah dihapus**');
        expect(replyThread.username).toEqual(payload.username);
        expect(replyThread.date).toEqual(payload.date);
        expect(replyThread.replies).toEqual(payload.replies);
    });
});
