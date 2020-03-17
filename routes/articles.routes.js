const articlesRouter = require('express').Router();
const {
  sendArticleById,
  updateVotesById,
  sendCommentsByArticleId
  // addCommentByArticleId
} = require('../controllers/articles.controllers');
const { send405Error } = require('../errors/index');

articlesRouter
  .route('/:article_id')
  .get(sendArticleById)
  .patch(updateVotesById)
  .all(send405Error);

articlesRouter.route('/:article_id/comments').get(sendCommentsByArticleId);
// .post(addCommentByArticleId);

//add 405 error handling

module.exports = articlesRouter;
