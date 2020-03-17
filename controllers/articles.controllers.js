const {
  selectArticleById,
  patchVotesById,
  selectCommentsByArticleId
} = require('../models/articles.models');

exports.sendArticleById = (req, res, next) => {
  selectArticleById(req.params.article_id)
    .then(article => {
      res.send({ article });
    })
    .catch(next);
};

exports.updateVotesById = (req, res, next) => {
  patchVotesById(req.body, req.params.article_id)
    .then(article => {
      res.send({ article });
    })
    .catch(next);
};

exports.sendCommentsByArticleId = (req, res, next) => {
  selectCommentsByArticleId(req.params.article_id).then(comments => {
    res.send({ comments });
  });
};
