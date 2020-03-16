const data = require('../data/index.js');

const { formatDates, formatComments, makeRefObj } = require('../utils/utils');

exports.seed = function(knex) {
  return knex.migrate
    .rollback()
    .then(() => {
      return knex.migrate.latest();
    })
    .then(() => {
      const usersInsertions = knex('users')
        .insert(data.userData)
        .returning('*');
      const topicsInsertions = knex('topics')
        .insert(data.topicData)
        .returning('*');

      return Promise.all([topicsInsertions, usersInsertions]);
    })
    .then(() => {
      const correctDateArticles = formatDates(data.articleData);
      return knex('articles')
        .insert(correctDateArticles)
        .returning('*');
    })
    .then(articleRows => {
      const articleRef = makeRefObj(articleRows);
      const correctDateComments = formatDates(data.commentData);
      const editedComments = formatComments(correctDateComments, articleRef);
      return knex('comments')
        .insert(editedComments)
        .returning('*');
    });
};
