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
      article.comment_count = comments.length;
      return article;
    });
};

exports.patchVotesById = (votes, article_id) => {
  return connection('articles')
    .where('article_id', article_id)
    .increment('votes', votes)
    .returning('*')
    .then(articles => {
      return articles[0];
    });
};
