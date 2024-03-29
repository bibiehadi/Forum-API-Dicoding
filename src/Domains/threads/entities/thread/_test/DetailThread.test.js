const DetailThread = require('../DetailThread');
const CommentThread = require('../../comment/CommentThread');

describe('a DetailThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'dicoding thread',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'asdsa',
      title: 'dicoding thread',
      body: 'sebuah thread dicoding',
      date: '1231481',
      username: 'dicoding',
      comments: 'asdask',
    };

    // Action and Assert
    expect(() => new DetailThread(payload)).toThrowError('DETAIL_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create detailThread object correctly and comments is undifined', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'dicoding thread',
      body: 'sebuah thread dicoding',
      date: '2023-12-12T07:20:20.213Z',
      username: 'dicoding',
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual([]);
    expect(detailThread.comments).toHaveLength(0);
  });

  it('should create detailThread object correctly', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'dicoding thread',
      body: 'sebuah thread dicoding',
      date: '2023-12-12T07:20:20.213Z',
      username: 'dicoding',
      comments: [],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
    expect(detailThread.comments).toHaveLength(0);
  });

  it('should create detailThread object correctly and have comments', () => {
    // Arrange
    const payload = {
      id: 'thread-1234',
      title: 'dicoding thread',
      body: 'sebuah thread dicoding',
      date: '2023-12-12T07:20:20.213Z',
      username: 'dicoding',
      comments: [
        new CommentThread({
          id: 'comment-12346',
          content: 'sebuah comment',
          username: 'dicoding2',
          date: '2023-12-25T03:47:27.796Z',
          likes: 0,
          replies: [],
        }),
        new CommentThread({
          id: 'comment-12346',
          content: 'sebuah comment 2',
          username: 'dicoding1',
          date: '2023-12-25T03:43:27.796Z',
          likes: 0,
          replies: [],
        }),
      ],
    };

    // Action
    const detailThread = new DetailThread(payload);

    // Assert
    expect(detailThread.id).toEqual(payload.id);
    expect(detailThread.title).toEqual(payload.title);
    expect(detailThread.body).toEqual(payload.body);
    expect(detailThread.date).toEqual(payload.date);
    expect(detailThread.username).toEqual(payload.username);
    expect(detailThread.comments).toEqual(payload.comments);
    expect(detailThread.comments).toHaveLength(2);
  });
});
