class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._threadRepository.getCommentsByThread(thread.id);
    thread.comments = comments;
    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
