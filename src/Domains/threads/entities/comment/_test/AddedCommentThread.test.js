const AddedCommentThread = require('../AddedCommentThread');

describe('a AddedCommentThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'comment thread',
      owner: 'user-1234',
    };

    // Action and Assert
    expect(() => new AddedCommentThread(payload)).toThrowError('ADDED_COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 123,
      content: 'dicoding',
      owner: {},
    };

    // Action and Assert
    expect(() => new AddedCommentThread(payload)).toThrowError('ADDED_COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedCommentThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-1234',
      content: 'comment thread',
      owner: 'user-1234',
    };

    // Action
    const addedCommentThread = new AddedCommentThread(payload);

    // Assert
    expect(addedCommentThread.id).toEqual(payload.id);
    expect(addedCommentThread.content).toEqual(payload.content);
    expect(addedCommentThread.owner).toEqual(payload.owner);
  });
});
