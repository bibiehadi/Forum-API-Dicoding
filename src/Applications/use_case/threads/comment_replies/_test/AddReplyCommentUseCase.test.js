const AddedCommentThread = require('../../../../../Domains/threads/entities/comment/AddedCommentThread');
const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const AddReplyCommentUseCase = require('../AddReplyCommentUseCase');

describe('AddReplyCommentUseCase', () => {
    it('should orchestrating the add comment action correctly', async () => {
        const content = {
            content : 'this is comment reply'
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

        //  mocking needed function
        mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
        mockThreadRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
        mockThreadRepository.addReplyComment = jest.fn().mockImplementation(() => Promise.resolve(mockAddedReply));

        const addRepyCommentUseCase = new AddReplyCommentUseCase({
            threadRepository: mockThreadRepository,
        });

        const addedReply = await addRepyCommentUseCase.execute(content,threadId, commentId, owner);

        expect(addedReply).toStrictEqual(new AddedCommentThread({
            id: 'reply-1234',
            content: content.content,
            owner,
        }));

        expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
        expect(mockThreadRepository.findCommentById).toBeCalledWith(commentId);
        expect(mockThreadRepository.addReplyComment).toBeCalledWith(content, commentId, owner);
    });
});
