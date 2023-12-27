const CommentThread = require('../CommentThread');
const ReplyThread = require("../ReplyThread");

describe('a CommentThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment thread',
      username: 'user-1234',
      date: '2021-08-08T07:59:18.982Z',
    };

    // Action and Assert
    expect(() => new CommentThread(payload)).toThrowError('COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
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
    expect(() => new CommentThread(payload)).toThrowError('COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create commentThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment thread',
      username: 'user-1234',
      date: '2021-08-08T07:59:18.982Z',
      replies: [],
    };

    // Action
    const commentThread = new CommentThread(payload);

    // Assert
    expect(commentThread.id).toEqual(payload.id);
    expect(commentThread.content).toEqual(payload.content);
    expect(commentThread.username).toEqual(payload.username);
    expect(commentThread.date).toEqual(payload.date);
    expect(commentThread.replies).toEqual(payload.replies);
    expect(commentThread.replies).toHaveLength(0);
  });

  it('should create commentThread object correctly and have replies', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment thread',
      username: 'user-1234',
      date: '2021-08-08T07:59:18.982Z',
      replies: [
        new ReplyThread({
            id: 'reply-123456',
            content: 'first reply',
            username: 'johndoe',
            date: '2023-12-25T03:47:27.901Z',
          }
        )
      ],
    };

    // Action
    const commentThread = new CommentThread(payload);

    // Assert
    expect(commentThread.id).toEqual(payload.id);
    expect(commentThread.content).toEqual(payload.content);
    expect(commentThread.username).toEqual(payload.username);
    expect(commentThread.date).toEqual(payload.date);
    expect(commentThread.replies).toEqual(payload.replies);
    expect(commentThread.replies).toHaveLength(1);
  });

  it('should create commentThread object correctly if is_deleted is true', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment thread',
      username: 'user-1234',
      date: '2021-08-08T07:59:18.982Z',
      replies: [],
      is_deleted: true,
    };

    // Action
    const commentThread = new CommentThread(payload);

    // Assert
    expect(commentThread.id).toEqual(payload.id);
    expect(commentThread.content).toEqual('**komentar telah dihapus**');
    expect(commentThread.username).toEqual(payload.username);
    expect(commentThread.date).toEqual(payload.date);
    expect(commentThread.replies).toEqual(payload.replies);
    expect(commentThread.replies).toHaveLength(0);
  });
});
