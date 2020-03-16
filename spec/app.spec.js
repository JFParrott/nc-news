process.env.NODE_ENV = test;
const knex = require('../db/connection')


beforeEach(() => {
  knex.seed.run()
})