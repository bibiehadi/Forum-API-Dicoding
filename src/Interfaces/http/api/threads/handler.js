const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase');
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase');
class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this);
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
    const detailThread = await getDetailThreadUseCase.execute(id);


    const response = h.response({
      status: 'success',
      data: {
        detailThread,
      },
    });

    response.code(200);
    return response;
  }
}

module.exports = ThreadsHandler;
