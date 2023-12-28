const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const SafeDeleteCommentUseCase = require('../SafeDeleteCommentUseCase');

describe('SafeDeleteCommentUsecase', () => {
  it('should orchestrating the safe delete comment action correctly', async () => {
    const content = 'this is comment';

    const owner = 'user-1234';
    const threadId = 'thread-1234';
    const commentId = 'comment-1234';

    const mockedDeleteComment = {
      id: 'comment-1234',
      content: 'this is comment',
      username: 'dicoding',
      date: '2023-12-28T16:57:45.526Z',
      is_deleted: true
    };

    //  create dependency
    const mockThreadRepository = new ThreadRepository();

    //  mocking needed function
    mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockThreadRepository.deleteComment = jest.fn().mockImplementation(() => Promise.resolve(mockedDeleteComment));

    const safeDeleteCommentUseCase = new SafeDeleteCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    const deleteComment = await safeDeleteCommentUseCase.execute(commentId, threadId, owner);
    expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.findCommentById).toBeCalledWith(commentId);
    expect(mockThreadRepository.verifyCommentOwner).toBeCalledWith(commentId, owner);
    expect(mockThreadRepository.deleteComment).toBeCalledWith(commentId, threadId);
  });
});
