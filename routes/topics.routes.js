const topicsRouter = require('express').Router();
const { sendTopics } = require('../controllers/topics.controllers');

topicsRouter.get('/', sendTopics);

module.exports = topicsRouter;
