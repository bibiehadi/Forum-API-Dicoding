const ReplyThread = require("../../../Domains/threads/entities/comment/ReplyThread");

class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository, commentLikeRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._commentLikeRepository = commentLikeRepository;
    this._replyRepository = replyRepository;
  }

  async execute(id) {
    const thread = await this._threadRepository.getThreadById(id);
    const comments = await this._commentRepository.getCommentsByThread(id);
    const commentLikes = await this._commentRepository.getCommentLikesByThreadId(id);
    const allReplies = await this._replyRepository.getRepliesByThread(id);
    thread.comments = comments.map((comment) => {
      const likeCount = commentLikes.filter((likeCount) => likeCount.id === comment.id);
      comment.likeCount = (likeCount.length === 0) ? 0 : parseInt(likeCount[0].likes);
      const replies = allReplies.filter((reply) => reply.comment_id === comment.id);
      comment.replies = replies.map((reply) => new ReplyThread(reply));
      return comment;
    });
    return thread;
  }
}

module.exports = GetDetailThreadUseCase;
