class SafeDeleteCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(commentId, threadId, userId) {
    await this._threadRepository.findThreadById(threadId);
    await this._commentRepository.findCommentById(commentId);
    await this._commentRepository.verifyCommentOwner(commentId, userId);
    return this._commentRepository.deleteComment(commentId, threadId);
  }
}

module.exports = SafeDeleteCommentUseCase;
