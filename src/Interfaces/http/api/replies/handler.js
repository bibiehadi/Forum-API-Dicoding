const AddReplyCommentUseCase = require('../../../../Applications/use_case/threads/comment_replies/AddReplyCommentUseCase');
const SafeDeleteReplyUseCase = require('../../../../Applications/use_case/threads/comment_replies/SafeDeleteReplyUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyThreadHandler = this.postReplyThreadHandler.bind(this);
    this.deleteReplyThreadHandler = this.deleteReplyThreadHandler.bind(this);
  }

  async postReplyThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const addReplyCommentUseCase = this._container.getInstance(AddReplyCommentUseCase.name);
    const addedReply = await addReplyCommentUseCase.execute(request.payload, threadId, commentId, userId);
    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });

    response.code(201);
    return response;
  }

  async deleteReplyThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyThreadHandler = this._container.getInstance(SafeDeleteReplyUseCase.name);
    const deletedReply = await deleteReplyThreadHandler.execute(replyId, threadId, commentId, userId);
    const response = h.response({
      status: 'success',
      data: {
        deletedReply,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = RepliesHandler;
