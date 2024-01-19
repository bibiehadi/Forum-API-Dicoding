class SafeDeleteReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(replyId, threadId, commentId, userId) {
    await this._threadRepository.findThreadById(threadId);
    await this._commentRepository.findCommentById(commentId);
    await this._replyRepository.findReplyById(replyId);
    await this._replyRepository.verifyReplyOwner(replyId, userId);
    return this._replyRepository.deleteReply(replyId, commentId);
  }
}

module.exports = SafeDeleteReplyUseCase;
