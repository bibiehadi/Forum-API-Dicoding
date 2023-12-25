const CommentThread = require("../../../Domains/threads/entities/comment/CommentThread");

class GetDetailThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(id) {
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._threadRepository.getCommentsByThread(thread.id);
    const allReplies = await this._threadRepository.getRepliesByThread(thread.id);
    const commentsWithReplies = comments.map((comment) => {
      const replies = allReplies.filter((reply) => reply.comment_id === comment.id);
      comment.replies = replies.map((reply) => new CommentThread(reply));
      return comment;
    });
    // console.log(commentsWithReplies);
    thread.comments = commentsWithReplies;
    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
