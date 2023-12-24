const DetailThread = require('../../../Domains/threads/entities/DetailThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetDetailThreadUseCase = require('../GetDetailThreadUseCase');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrasting the get detail action correctly', async () => {
    const threadId = 'thread-1234';

    const mockDetailThread = new DetailThread({
      id: 'thread-1234',
      title: 'Thread Dicoding',
      body: 'This is body thread Dicoding',
      date: '2021-08-08T07:19:09.775Z',
      username: 'dicoding',
      comments: [],
    });

    //  create dependency
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockDetailThread));
    mockThreadRepository.getCommentsByThread = jest.fn().mockImplementation(() => Promise.resolve());

    const detailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // action

    const detailThread = await detailThreadUseCase.execute(threadId);

    expect(detailThread).toStrictEqual(new DetailThread(mockDetailThread));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
  });
});
