const CommentLikeRepository = require('../CommentLikeRepository');

describe('CommentLikeRepository interface', () => {
    it('should throw error when invoke abstract behavior', async () => {
        // Arrange
        const commentLikeRepository = new CommentLikeRepository();

        // Action and Assert
        await expect(commentLikeRepository.addCommentLike('','')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(commentLikeRepository.findCommentLikeId('', '')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
        await expect(commentLikeRepository.deleteCommentLikeById('')).rejects.toThrowError('COMMENT_LIKE_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    });
});
