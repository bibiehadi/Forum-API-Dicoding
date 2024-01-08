const routes = (handler) => ([
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
