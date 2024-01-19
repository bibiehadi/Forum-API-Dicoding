const AddCommentThread = require('../AddCommentThread');

describe('a AddCommentThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: null,
    };

    // Action and Assert
    expect(() => new AddCommentThread(payload)).toThrowError('ADD_COMMENT_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 1234,
    };

    // Action and Assert
    expect(() => new AddCommentThread(payload)).toThrowError('ADD_COMMENT_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create addedCommentThread object correctly', () => {
    // Arrange
    const payload = {
      content: 'comment thread',
    };

    // Action
    const addedCommentThread = new AddCommentThread(payload);

    // Assert
    expect(addedCommentThread.content).toEqual(payload.content);
  });
});
