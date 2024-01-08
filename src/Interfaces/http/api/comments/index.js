const CommentsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
    name: 'comments',
    register: async (server, { container }) => {
        const commentsHadler = new CommentsHandler(container);
        server.route(routes(commentsHadler));
    },
};
