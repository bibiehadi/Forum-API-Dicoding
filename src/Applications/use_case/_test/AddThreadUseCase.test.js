const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddThreadUseCase = require('../AddThreadUseCase');

describe('AddThreadUseCase', () => {
  it('should orchestrating the add thread action correctly', async () => {
    const useCasePayload = {
      title: 'Thread Dicoding',
      body: 'This is body thread Dicoding',
    };

    const owner = 'user-1234';

    const mockAddedThread = new AddedThread({
      id: 'thread-1234',
      title: useCasePayload.title,
      owner,
    });

    //  create dependency
    const mockThreadRepository = new ThreadRepository();

    //  mocking needed function
    mockThreadRepository.addThread = jest.fn().mockImplementation(() => Promise.resolve(mockAddedThread));

    const getThreadUseCase = new AddThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    //  Action
    const addedThread = await getThreadUseCase.execute(useCasePayload, owner);

    //  Assert
    expect(addedThread).toStrictEqual(new AddedThread({
      id: 'thread-1234',
      title: useCasePayload.title,
      owner,
    }));

    expect(mockThreadRepository.addThread).toBeCalledWith(useCasePayload, owner);
  });
});
