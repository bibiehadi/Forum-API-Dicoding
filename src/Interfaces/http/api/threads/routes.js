const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler,
    options: {
      auth: 'forum_api_jwt',
    },
  },
  {
    method: 'GET',
    path: '/threads/{id}',
    handler: handler.getDetailThreadHandler,
  },
  {
    method: 'POST',
    path: '/threads/{id}/comments',
    handler: handler.postCommentThreadHandler,
    options: {
      auth: 'forum_api_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}',
    handler: handler.deleteCommentThreadHandler,
    options: {
      auth: 'forum_api_jwt',
    },
  },
]);

module.exports = routes;
