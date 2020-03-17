const connection = require('../db/connection');

exports.selectArticleById = article_id => {
  return connection('articles')
    .select('*')
    .where('article_id', article_id)
    .then(article => {
      return Promise.all([
        article[0],
        connection('comments')
          .select('*')
          .where('article_id', article_id)
      ]);
    })
    .then(([article, comments]) => {
      if (article === undefined) {
        return Promise.reject({
          status: 404,
          msg: 'Article ID does not exist'
        });
      } else {
        article.comment_count = comments.length;
        return article;
      }
    });
};

exports.patchVotesById = (body, article_id) => {
  if (body.inc_votes && typeof body.inc_votes === 'number') {
    return connection('articles')
      .where('article_id', article_id)
      .increment('votes', body.inc_votes)
      .returning('*')
      .then(articles => {
        if (articles.length === 0) {
          return Promise.reject({
            status: 404,
            msg: 'Article ID does not exist'
          });
        } else {
          return articles[0];
        }
      });
  } else {
    return Promise.reject({ status: 400, msg: 'Invalid input' });
  }
};

exports.selectCommentsByArticleId = article_id => {
  return connection('comments')
    .select('author', 'comment_id', 'votes', 'created_at', 'body')
    .where('article_id', article_id);
};
