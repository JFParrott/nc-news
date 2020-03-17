const articlesRouter = require('express').Router();
const {
  sendArticleById,
  updateVotesById
} = require('../controllers/articles.controllers');
const { send405Error } = require('../errors/index');

articlesRouter
  .route('/:article_id')
  .get(sendArticleById)
  .patch(updateVotesById)
  .all(send405Error);

//add 405 error handling

module.exports = articlesRouter;
