const { selectTopics } = require('../models/topics.models');

exports.sendTopics = (req, res, next) => {
  selectTopics()
    .then(topics => {
      res.send({ topics });
    })
    .catch(next);
};
