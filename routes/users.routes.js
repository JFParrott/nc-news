const usersRouter = require('express').Router();
const { sendUserByUsername } = require('../controllers/users.controllers');

usersRouter.get('/:username', sendUserByUsername);

module.exports = usersRouter;
