const LikeCommentUseCase = require('../../../../Applications/use_case/threads/comment_likes/LikeCommentUseCase');

class CommentLikesHandler {
    constructor(container) {
        this._container = container;

        this.likeCommentHandler = this.likeCommentHandler.bind(this);
    }
    async likeCommentHandler(request, h) {
        const { id: userId } = request.auth.credentials;
        const { id: threadId } = request.params;
        const { commentId } = request.params;
        const likeCommentUseCase = this._container.getInstance(LikeCommentUseCase.name);
        const result = await likeCommentUseCase.execute(threadId, commentId, userId);
        const response = h.response({
            status: 'success',
        });

        response.code(200);
        return response;
    }
}

module.exports = CommentLikesHandler;
