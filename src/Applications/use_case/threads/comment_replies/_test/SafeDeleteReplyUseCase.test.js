const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../../Domains/threads/CommentRepository');
const ReplyRepository = require('../../../../../Domains/threads/ReplyRepository');
const SafeDeleteReplyUseCase = require('../SafeDeleteReplyUseCase');

describe('SafeDeleteReplyUsecase', () => {
  it('should orchestrating the safe delete comment action correctly', async () => {
    const content = 'this is comment';

    const owner = 'user-1234';
    const threadId = 'thread-1234';
    const commentId = 'comment-1234';
    const replyId = 'reply-1234';
    const mockedDeletedReply = {
      id: replyId,
      content,
      owner,
      is_deleted: true,
      date: '2023-12-28T16:57:45.526Z',
    };

    //  create dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    //  mocking needed function
    mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.findReplyById = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.deleteReply = jest.fn().mockImplementation(() => Promise.resolve(mockedDeletedReply));

    const safeDeleteReplyUseCase = new SafeDeleteReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    await safeDeleteReplyUseCase.execute(replyId, threadId, commentId, owner);

    expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(commentId);
    expect(mockReplyRepository.findReplyById).toBeCalledWith(replyId);
    expect(mockReplyRepository.verifyReplyOwner).toBeCalledWith(replyId, owner);
    expect(mockReplyRepository.deleteReply).toBeCalledWith(replyId, commentId);
  });
});
