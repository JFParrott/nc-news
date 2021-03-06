const connection = require('../db/connection');
const { checkExists } = require('./utils.models');

exports.selectArticles = (article_id, query) => {
  const sort_by = query.sort_by || 'created_at';
  const order = query.order || 'desc';
  const author = query.author;
  const topic = query.topic;
  return connection
    .select('articles.*')
    .from('articles')
    .count({ comment_count: 'comments.article_id' })
    .leftJoin('comments', 'articles.article_id', 'comments.article_id')
    .groupBy('articles.article_id')
    .orderBy(sort_by, order)
    .modify(query => {
      if (article_id !== undefined)
        query.where('articles.article_id', article_id);
      if (author !== undefined) {
        query.where('articles.author', author);
      }
      if (topic !== undefined) query.where('articles.topic', topic);
    })
    .then(articles => {
      if (author) {
        return Promise.all([
          checkExists('users', 'username', author),
          articles
        ]);
      } else {
        return [true, articles];
      }
    })
    .then(([users, articles]) => {
      if (topic) {
        return Promise.all([
          users,
          articles,
          checkExists('topics', 'slug', topic)
        ]);
      } else {
        return [users, articles, true];
      }
    })
    .then(([users, articles, topics]) => {
      if (topics === undefined)
        return Promise.reject({ status: 404, msg: 'Topic does not exist' });
      if (users === undefined)
        return Promise.reject({ status: 404, msg: 'Invalid Username' });
      if (article_id !== undefined && articles[0] === undefined) {
        return Promise.reject({
          status: 404,
          msg: 'Article ID does not exist'
        });
      } else if (article_id === undefined) {
        return articles;
      } else {
        return articles[0];
      }
    });
};

exports.patchArticleVotesById = (body, article_id) => {
  const { inc_votes } = body;
  if (inc_votes && typeof inc_votes === 'number') {
    return connection('articles')
      .where('article_id', article_id)
      .increment('votes', inc_votes)
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

exports.selectCommentsByArticleId = (article_id, query) => {
  const sort_by = query.sort_by || 'created_at';
  const order = query.order || 'desc';
  return connection('comments')
    .select('author', 'comment_id', 'votes', 'created_at', 'body')
    .where('article_id', article_id)
    .orderBy(sort_by, order)
    .returning('*')
    .then(comments => {
      return Promise.all([
        comments,
        checkExists('articles', 'article_id', article_id)
      ]);
    })
    .then(([comments, exists]) => {
      if (exists !== undefined) {
        return comments;
      } else {
        return Promise.reject({
          status: 404,
          msg: 'Article ID does not exist'
        });
      }
    });
};

exports.insertCommentByArticleId = (body, article_id) => {
  body.article_id = article_id;
  body.author = body.username;
  delete body.username;
  return connection('comments')
    .insert(body)
    .returning('*')
    .then(comment => {
      return comment[0];
    });
};
