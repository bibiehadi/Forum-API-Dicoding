const AddCommentThread = require('../../../../Domains/threads/entities/comment/AddCommentThread');

class AddCommentThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload, threadId, userId) {
    const content = new AddCommentThread(useCasePayload);
    await this._threadRepository.findThreadById(threadId);
    return this._commentRepository.addComment(content, threadId, userId);
  }
}

module.exports = AddCommentThreadUseCase;
