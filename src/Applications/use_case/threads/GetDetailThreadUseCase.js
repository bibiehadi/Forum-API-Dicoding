const ReplyThread = require("../../../Domains/threads/entities/comment/ReplyThread");

class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._threadRepository.getCommentsByThread(id);
    const allReplies = await this._threadRepository.getRepliesByThread(id);
    thread.comments = comments.map((comment) => {
      const replies = allReplies.filter((reply) => reply.comment_id === comment.id);
      comment.replies = replies.map((reply) => new ReplyThread(reply));
      return comment;
    });
    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
