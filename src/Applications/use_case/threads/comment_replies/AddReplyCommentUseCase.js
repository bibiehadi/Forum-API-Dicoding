const AddCommentThread = require('../../../../Domains/threads/entities/comment/AddCommentThread');

class AddReplyCommentUseCase {
    constructor({ threadRepository }) {
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload, threadId, commentId, userId) {
        const content = new AddCommentThread(useCasePayload);
        await this._threadRepository.findThreadById(threadId);
        await this._threadRepository.findCommentById(commentId);
        return this._threadRepository.addReplyComment(content, commentId, userId);
    }
}

module.exports = AddReplyCommentUseCase;
