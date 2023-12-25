class SafeDeleteReplyUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(replyId, threadId, commentId, userId) {
        await this._threadRepository.findThreadById(threadId);
        await this._threadRepository.findCommentById(commentId);
        await this._threadRepository.findReplyById(replyId);
        await this._threadRepository.verifyReplyOwner(replyId, userId);
        return this._threadRepository.deleteReply(replyId, commentId);
    }
}

module.exports = SafeDeleteReplyUseCase;
