const connection = require('../db/connection');

exports.selectUserByUsername = username => {
  return connection('users')
    .select('*')
    .where('username', username)
    .then(user => {
      if (user.length === 0) {
        return Promise.reject({ status: 404, msg: 'Invalid Username' });
      } else {
        return user[0];
      }
    });
};
