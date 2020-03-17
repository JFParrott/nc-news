const usersRouter = require('express').Router();
const { sendUserByUsername } = require('../controllers/users.controllers');
const { send405Error } = require('../errors/index');

usersRouter
  .route('/:username')
  .get(sendUserByUsername)
  .all(send405Error);

module.exports = usersRouter;
