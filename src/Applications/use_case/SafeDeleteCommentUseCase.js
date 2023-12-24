class SafeDeleteCommentUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(commentId, threadId, userId) {
    await this._threadRepository.findThreadById(threadId);
    await this._threadRepository.findCommentById(commentId);
    await this._threadRepository.verifyCommentOwner(commentId, userId);
    const result = await this._threadRepository.deleteComment(commentId, threadId);
    return result;
  }
}

module.exports = SafeDeleteCommentUseCase;
