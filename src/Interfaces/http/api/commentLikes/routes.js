const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{id}/comments/{commentId}/likes',
    handler: handler.likeCommentHandler,
    options: {
      auth: 'forum_api_jwt',
    },
  },
]);

module.exports = routes;
