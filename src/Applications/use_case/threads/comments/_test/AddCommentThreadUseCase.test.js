const AddedCommentThread = require('../../../../../Domains/threads/entities/comment/AddedCommentThread');
const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../../Domains/threads/CommentRepository');
const AddCommentThreadUsecase = require('../AddCommentThreadUseCase');

describe('AddCommentThreadUsecase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const content = {
      content: 'this is comment',
    };

    const owner = 'user-1234';
    const threadId = 'thread-1234';

    const mockAddedComment = new AddedCommentThread({
      id: 'comment-1234',
      content: 'this is comment',
      owner,
    });

    //  create dependency
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    //  mocking needed function
    mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockAddedComment));

    const addCommentUseCase = new AddCommentThreadUsecase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const addedComment = await addCommentUseCase.execute(content, threadId, owner);

    expect(addedComment).toStrictEqual(new AddedCommentThread({
      id: 'comment-1234',
      content: content.content,
      owner,
    }));

    expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
    expect(mockCommentRepository.addComment).toBeCalledWith(content, threadId, owner);
  });
});
