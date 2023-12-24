const AddCommentThread = require('../../Domains/threads/entities/AddCommentThread');

class AddCommentThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, threadId, userId) {
    const content = new AddCommentThread(useCasePayload);
    await this._threadRepository.findThreadById(threadId);
    return this._threadRepository.addComment(content, threadId, userId);
  }
}

module.exports = AddCommentThreadUseCase;
