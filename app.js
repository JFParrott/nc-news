const express = require('express');
const app = express();
const apiRouter = require('./routes/api.routes.js');
const { psqlErrors, otherErrors } = require('./errors');

app.use(express.json());

app.use('/api', apiRouter);

app.all('/*', (req, res, next) => {
  next({ status: 404, msg: 'Route not found' });
});

app.use(psqlErrors);

app.use(otherErrors);

module.exports = app;
