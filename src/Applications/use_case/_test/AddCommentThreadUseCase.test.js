const AddedCommentThread = require('../../../Domains/threads/entities/AddedCommentThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentThreadUsecase = require('../AddCommentThreadUseCase');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');

describe('AddCommentThreadUsecase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const content = {
      content : 'this is comment'
    };

    const owner = 'user-1234';
    const threadId = 'thread-1234';

     const mockAddedThread = new AddedThread({
      id: 'thread-1234',
      title: 'Thread Dicoding',
      owner,
    });

    const mockAddedComment = new AddedCommentThread({
      id: 'comment-1234',
      content: 'this is comment',
      owner,
    });

    //  create dependency
    const mockThreadRepository = new ThreadRepository();

    //  mocking needed function
    mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
     mockThreadRepository.addComment = jest.fn().mockImplementation(() => Promise.resolve(mockAddedComment));

    const addCommentUseCase = new AddCommentThreadUsecase({
      threadRepository: mockThreadRepository,
    });

    const addedComment = await addCommentUseCase.execute(content, threadId, owner);

    expect(addedComment).toStrictEqual(new AddedCommentThread({
      id: 'comment-1234',
      content: content.content,
      owner,
    }));

    expect(mockThreadRepository.addComment).toBeCalledWith(content, threadId, owner);
  });
});
