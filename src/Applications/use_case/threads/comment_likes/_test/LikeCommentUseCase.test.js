const ThreadRepository = require('../../../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../../../Domains/threads/CommentRepository');
const CommentLikeRepository = require('../../../../../Domains/threads/CommentLikeRepository');
const LikeCommentUseCase = require('../LikeCommentUseCase');

describe('LikeCommentUseCase', () => {
    it('should orchestrating the like comment action correctly', async () => {
        const owner = 'user-1234';
        const threadId = 'thread-1234';
        const commentId = 'comment-1234';
        const commentLikeId = 'commentLike-1234';


        //  create dependency
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockCommentLikeRepository = new CommentLikeRepository();

        //  mocking needed function
        mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentLikeRepository.findCommentLikeId = jest.fn().mockImplementation(() => Promise.resolve(commentLikeId));
        mockCommentLikeRepository.deleteCommentLikeById = jest.fn().mockImplementation(() => Promise.resolve());

        const likeCommentUseCase = new LikeCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            commentLikeRepository: mockCommentLikeRepository,
        });

        await likeCommentUseCase.execute(threadId, commentId, owner);
        expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
        expect(mockCommentRepository.findCommentById).toBeCalledWith(commentId);
        expect(mockCommentLikeRepository.findCommentLikeId).toBeCalledWith(commentId, owner);
        expect(mockCommentLikeRepository.deleteCommentLikeById).toBeCalledWith(commentLikeId);
    });

    it('should orchestrating the unlike comment action correctly', async () => {
        const owner = 'user-1234';
        const threadId = 'thread-1234';
        const commentId = 'comment-1234';


        //  create dependency
        const mockThreadRepository = new ThreadRepository();
        const mockCommentRepository = new CommentRepository();
        const mockCommentLikeRepository = new CommentLikeRepository();

        //  mocking needed function
        mockThreadRepository.findThreadById = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentRepository.findCommentById = jest.fn().mockImplementation(() => Promise.resolve());
        mockCommentLikeRepository.findCommentLikeId = jest.fn().mockImplementation(() => Promise.resolve(null));
        mockCommentLikeRepository.addCommentLike = jest.fn().mockImplementation(() => Promise.resolve());

        const likeCommentUseCase = new LikeCommentUseCase({
            threadRepository: mockThreadRepository,
            commentRepository: mockCommentRepository,
            commentLikeRepository: mockCommentLikeRepository,
        });

        await likeCommentUseCase.execute(threadId, commentId, owner);
        expect(mockThreadRepository.findThreadById).toBeCalledWith(threadId);
        expect(mockCommentRepository.findCommentById).toBeCalledWith(commentId);
        expect(mockCommentLikeRepository.findCommentLikeId).toBeCalledWith(commentId, owner);
        expect(mockCommentLikeRepository.addCommentLike).toBeCalledWith(commentId, owner);
    });

});
