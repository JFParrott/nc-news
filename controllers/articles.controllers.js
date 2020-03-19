const {
  selectArticles,
  patchArticleVotesById,
  selectCommentsByArticleId,
  insertCommentByArticleId
} = require('../models/articles.models');

exports.sendArticles = (req, res, next) => {
  selectArticles(req.params.article_id, req.query)
    .then(articles => {
      if (Array.isArray(articles)) res.send({ articles });
      else res.send({ article: articles });
    })
    .catch(next);
};

exports.updateArticleVotesById = (req, res, next) => {
  patchArticleVotesById(req.body, req.params.article_id)
    .then(article => {
      res.send({ article });
    })
    .catch(next);
};

exports.sendCommentsByArticleId = (req, res, next) => {
  selectCommentsByArticleId(req.params.article_id, req.query)
    .then(comments => {
      res.send({ comments });
    })
    .catch(next);
};

exports.addCommentByArticleId = (req, res, next) => {
  insertCommentByArticleId(req.body, req.params.article_id)
    .then(comment => {
      res.status(201).send({ comment });
    })
    .catch(next);
};
