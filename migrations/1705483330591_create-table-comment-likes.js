/* eslint-disable camelcase */

exports.up = (pgm) => {
    pgm.createTable('comment_likes', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        comment_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        liker: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    });
    pgm.addConstraint('comment_likes', 'fk_comment_likes.comment_like.id', 'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE');
    pgm.addConstraint('comment_likes', 'fk_comment_likes.user_like.id', 'FOREIGN KEY(liker) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
    pgm.dropTable('comment_likes');
};
