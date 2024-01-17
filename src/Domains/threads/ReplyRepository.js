class ReplyRepository {
    async addReplyComment(content, commentId, userId){
        throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async getRepliesByThread(threadId) {
        throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async findReplyById(id) {
        throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async verifyReplyOwner(replyId, owner) {
        throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }

    async deleteReply(replyId, commentId) {
        throw new Error('REPLY_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    }
}

module.exports = ReplyRepository;
