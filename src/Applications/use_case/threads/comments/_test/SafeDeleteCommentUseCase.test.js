const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../../Domains/threads/CommentRepository');
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
      owner: 'user-1234',
      date: '2023-12-28T16:57:45.526Z',
      is_deleted: true
    };

    //  create dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    //  mocking needed function
    mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.verifyCommentOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.deleteComment = jest.fn().mockImplementation(() => Promise.resolve(mockedDeleteComment));

    const safeDeleteCommentUseCase = new SafeDeleteCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const deleteComment = await safeDeleteCommentUseCase.execute(commentId, threadId, owner);
    expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(commentId);
    expect(mockCommentRepository.verifyCommentOwner).toBeCalledWith(commentId, owner);
    expect(mockCommentRepository.deleteComment).toBeCalledWith(commentId, threadId);
  });
});
