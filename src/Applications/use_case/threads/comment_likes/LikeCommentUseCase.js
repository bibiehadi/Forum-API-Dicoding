class LikeCommentUseCase {
    constructor({ threadRepository, commentRepository, commentLikeRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._commentLikeRepository = commentLikeRepository;
    }

    async execute(threadId, commentId, userId) {
        await this._threadRepository.findThreadById(threadId);
        await this._commentRepository.findCommentById(commentId);
        const likeId = await this._commentLikeRepository.findCommentLikeId(commentId, userId);
        if(likeId != null) {
            return this._commentLikeRepository.deleteCommentLikeById(likeId);
        }
        return this._commentLikeRepository.addCommentLike(commentId, userId);
    }
}

module.exports = LikeCommentUseCase;
