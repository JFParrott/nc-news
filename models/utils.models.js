const connection = require('../db/connection');

exports.checkExists = (table, column, query) => {
  return connection(table)
    .select()
    .where({ [column]: query })
    .first();
};
