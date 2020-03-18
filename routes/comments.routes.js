const commentsRouter = require('express').Router();
const {
  updateCommentVotesByCommentId,
  deleteCommentByCommentId
} = require('../controllers/comments.controllers');
const { send405Error } = require('../errors');

commentsRouter
  .route('/:comment_id')
  .patch(updateCommentVotesByCommentId)
  .delete(deleteCommentByCommentId)
  .all(send405Error);

module.exports = commentsRouter;
