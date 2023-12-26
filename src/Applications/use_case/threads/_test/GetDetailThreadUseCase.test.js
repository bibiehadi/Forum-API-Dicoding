const DetailThread = require('../../../../Domains/threads/entities/thread/DetailThread');
const ThreadRepository = require('../../../../Domains/threads/ThreadRepository');
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

    const mockCommentsThread = [
      {
        id: 'comment-12345',
        content: 'sebuah comment',
        username: 'dicoding',
        date: '2023-12-25T03:47:27.778Z'
      },
      {
        id: 'comment-12346',
        content: 'sebuah comment',
        username: 'dicoding2',
        date: '2023-12-25T03:47:27.796Z'
      }
    ];

    const mockRepliesComment =        [
      {
        id: 'reply-12345',
        content: 'sebuah balasan',
        username: 'dicoding2',
        date: '2023-12-25T03:47:27.922Z',
        comment_id: 'comment-12345'
      },
      {
        id: 'reply-123456',
        content: '**balasan telah dihapus**',
        username: 'johndoe',
        date: '2023-12-25T03:47:27.901Z',
        comment_id: 'comment-12345'
      }
    ]


    //  create dependency
    const mockThreadRepository = new ThreadRepository();

    // mocking needed function
    mockThreadRepository.getThreadById = jest.fn().mockImplementation(() => Promise.resolve(mockDetailThread));
    mockThreadRepository.getCommentsByThread = jest.fn().mockImplementation(() => Promise.resolve(mockCommentsThread));
    mockThreadRepository.getRepliesByThread = jest.fn().mockImplementation(() => Promise.resolve(mockRepliesComment));

    const detailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // action

    const detailThread = await detailThreadUseCase.execute(threadId);

    expect(detailThread).toStrictEqual(new DetailThread(mockDetailThread));

    expect(mockThreadRepository.getThreadById).toBeCalledWith(threadId);
    expect(mockThreadRepository.getCommentsByThread).toBeCalledWith(threadId);
    expect(mockThreadRepository.getRepliesByThread).toBeCalledWith(threadId);
  });
});
