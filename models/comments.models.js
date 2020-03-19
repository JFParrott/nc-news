const connection = require('../db/connection');

exports.patchCommentVotesByCommentId = (body, comment_id) => {
  const { inc_votes } = body;
  if (inc_votes && typeof inc_votes === 'number') {
    return connection('comments')
      .where('comment_id', comment_id)
      .increment('votes', inc_votes)
      .returning('*')
      .then(comment => {
        if (comment.length === 0) {
          return Promise.reject({
            status: 404,
            msg: 'Comment ID does not exist'
          });
        } else {
          return comment[0];
        }
      });
  } else {
    return Promise.reject({ status: 400, msg: 'Invalid input' });
  }
};

exports.removeCommentByCommentId = comment_id => {
  return connection('comments')
    .where('comment_id', comment_id)
    .del()
    .then(res => {
      if (res === 0) {
        return Promise.reject({
          status: 404,
          msg: 'Comment ID does not exist'
        });
      } else {
        return res;
      }
    });
};
