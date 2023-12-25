const AddThreadUseCase = require('../../../../Applications/use_case/threads/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/threads/GetDetailThreadUseCase');

const AddCommentThreadUseCase = require('../../../../Applications/use_case/threads/comments/AddCommentThreadUseCase');
const SafeDeleteCommentUseCase = require("../../../../Applications/use_case/threads/comments/SafeDeleteCommentUseCase");

const AddReplyCommentUseCase = require('../../../../Applications/use_case/threads/comment_replies/AddReplyCommentUseCase');
const SafeDeleteReplyUseCase = require("../../../../Applications/use_case/threads/comment_replies/SafeDeleteReplyUseCase");

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
    this.postCommentThreadHandler = this.postCommentThreadHandler.bind(this);
    this.deleteCommentThreadHandler = this.deleteCommentThreadHandler.bind(this);
    this.postReplyThreadHandler = this.postReplyThreadHandler.bind(this);
    this.deleteReplyThreadHandler = this.deleteReplyThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name);
    const addedThread = await addThreadUseCase.execute(request.payload, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedThread,
      },
    });
    response.code(201);
    return response;
  }

  async getDetailThreadHandler(request, h) {
    const { id } = request.params;
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name);
    const thread = await getDetailThreadUseCase.execute(id);



    const response = h.response({
      status: 'success',
      data: {
        thread,
      },
    });

    response.code(200);
    return response;
  }

  async postCommentThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { id: threadId } = request.params;
    const addCommentThreadUseCase = this._container.getInstance(AddCommentThreadUseCase.name);
    const addedComment = await addCommentThreadUseCase.execute(request.payload, threadId, userId);

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });

    response.code(201);
    return response;
  }

  async deleteCommentThreadHandler(request, h) {
    const { id: userId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const deleteCommentThreadUseCase = this._container.getInstance(SafeDeleteCommentUseCase.name);
      const deletedComment = await deleteCommentThreadUseCase.execute(commentId, threadId, userId);
      const response = h.response({
        status: 'success',
        data: {
          deletedComment,
        },
      });

      response.code(200);
      return response;
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

module.exports = ThreadsHandler;
