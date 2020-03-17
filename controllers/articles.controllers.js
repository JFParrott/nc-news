const {
  selectArticleById,
  patchVotesById
} = require('../models/articles.models');

exports.sendArticleById = (req, res, next) => {
  selectArticleById(req.params.article_id).then(article => {
    res.send({ article });
  });
};

exports.updateVotesById = (req, res, next) => {
  patchVotesById(req.body.inc_votes, req.params.article_id).then(article => {
    res.send({ article });
  });
};
