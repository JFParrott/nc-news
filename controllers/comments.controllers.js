const {
  patchCommentVotesByCommentId,
  removeCommentByCommentId
} = require('../models/comments.models');

exports.updateCommentVotesByCommentId = (req, res, next) => {
  patchCommentVotesByCommentId(req.body, req.params.comment_id)
    .then(comment => {
      res.send({ comment });
    })
    .catch(next);
};

exports.deleteCommentByCommentId = (req, res, next) => {
  removeCommentByCommentId(req.params.comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
