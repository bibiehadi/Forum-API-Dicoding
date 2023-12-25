const AddThread = require('../../../Domains/threads/entities/thread/AddThread');

class AddThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload, userId) {
    const addThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(addThread, userId);
  }
}

module.exports = AddThreadUseCase;
