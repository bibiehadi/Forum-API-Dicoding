class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    return this._threadRepository.findThreadById(id);
  }
}

module.exports = GetDetailThreadUseCase;
