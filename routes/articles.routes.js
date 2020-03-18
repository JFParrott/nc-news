const articlesRouter = require('express').Router();
const {
  sendArticles,
  updateArticleVotesById,
  sendCommentsByArticleId,
  addCommentByArticleId
} = require('../controllers/articles.controllers');
const { send405Error } = require('../errors/index');

articlesRouter
  .route('/')
  .get(sendArticles)
  .all(send405Error);

articlesRouter
  .route('/:article_id')
  .get(sendArticles)
  .patch(updateArticleVotesById)
  .all(send405Error);

articlesRouter
  .route('/:article_id/comments')
  .get(sendCommentsByArticleId)
  .post(addCommentByArticleId)
  .all(send405Error);

module.exports = articlesRouter;
