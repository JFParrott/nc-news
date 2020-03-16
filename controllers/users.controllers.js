const { selectUserByUsername } = require('../models/users.models');

exports.sendUserByUsername = (req, res, next) => {
  selectUserByUsername(req.params.username).then(user => {
    res.send({ user });
  });
};
