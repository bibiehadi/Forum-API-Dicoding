const AddCommentThreadUseCase = require('../../../../Applications/use_case/threads/comments/AddCommentThreadUseCase');
const SafeDeleteCommentUseCase = require('../../../../Applications/use_case/threads/comments/SafeDeleteCommentUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentThreadHandler = this.postCommentThreadHandler.bind(this);
    this.deleteCommentThreadHandler = this.deleteCommentThreadHandler.bind(this);
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
}

module.exports = CommentsHandler;
