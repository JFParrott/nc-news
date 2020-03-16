const apiRouter = require('express').Router();
const topicsRouter = require('./topics.routes');
const usersRouter = require('./users.routes');

apiRouter.use('/topics', topicsRouter);
apiRouter.use('/users', usersRouter);

module.exports = apiRouter;
