const AddedCommentThread = require('../../../../../Domains/threads/entities/comment/AddedCommentThread');
const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../../Domains/threads/CommentRepository');
const ReplyRepository = require('../../../../../Domains/threads/ReplyRepository');
const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');

describe('AddReplyCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const content = {
      content: 'this is comment reply',
    };

    const owner = 'user-1234';
    const threadId = 'thread-1234';
    const commentId = 'comment-1234';

    const mockAddedReply = new AddedCommentThread({
      id: 'reply-1234',
      content: 'this is comment reply',
      owner,
    });

    //  create dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    //  mocking needed function
    mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
    mockReplyRepository.addReplyComment = jest.fn().mockImplementation(() => Promise.resolve(mockAddedReply));

    const addRepyCommentUseCase = new AddReplyCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const addedReply = await addRepyCommentUseCase.execute(content, threadId, commentId, owner);

    expect(addedReply).toStrictEqual(new AddedCommentThread({
      id: 'reply-1234',
      content: content.content,
      owner,
    }));

    expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.findCommentById).toBeCalledWith(commentId);
    expect(mockReplyRepository.addReplyComment).toBeCalledWith(content, commentId, owner);
  });
});
