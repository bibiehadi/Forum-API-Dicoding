const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const SafeDeleteReplyUseCase = require('../SafeDeleteReplyUseCase');

describe('SafeDeleteReplyUsecase', () => {
    it('should orchestrating the safe delete comment action correctly', async () => {
        const content = 'this is comment';

        const owner = 'user-1234';
        const threadId = 'thread-1234';
        const commentId = 'comment-1234';
        const replyId = 'reply-1234';
        //  create dependency
        const mockThreadRepository = new ThreadRepository();

        //  mocking needed function
        mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
        mockThreadRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
        mockThreadRepository.findReplyById = jest.fn().mockImplementation(() => Promise.resolve());
        mockThreadRepository.verifyReplyOwner = jest.fn().mockImplementation(() => Promise.resolve());
        mockThreadRepository.deleteReply = jest.fn().mockImplementation(() => Promise.resolve());

        const safeDeleteReplyUseCase = new SafeDeleteReplyUseCase({
            threadRepository: mockThreadRepository,
        });

        const deleteReply = await safeDeleteReplyUseCase.execute(replyId, threadId, commentId, owner);

        expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
        expect(mockThreadRepository.findCommentById).toBeCalledWith(commentId);
        expect(mockThreadRepository.findReplyById).toBeCalledWith(replyId);
        expect(mockThreadRepository.verifyReplyOwner).toBeCalledWith(replyId, owner);
        expect(mockThreadRepository.deleteReply).toBeCalledWith(replyId, commentId);
    });
});
