const AddCommentThread = require('../../../../Domains/threads/entities/comment/AddCommentThread');

class AddReplyCommentUseCase {
    constructor({ threadRepository, commentRepository, replyRepository }) {
        this._threadRepository = threadRepository;
        this._commentRepository = commentRepository;
        this._replyRepository = replyRepository;
    }

    async execute(useCasePayload, threadId, commentId, userId) {
        const content = new AddCommentThread(useCasePayload);
        await this._threadRepository.findThreadById(threadId);
        await this._commentRepository.findCommentById(commentId);
        return this._replyRepository.addReplyComment(content, commentId, userId);
    }
}

module.exports = AddReplyCommentUseCase;
