const express = require('express');
const app = express();
const apiRouter = require('./routes/api.routes.js');
const listEndpoints = require('express-list-endpoints');
const { psqlErrors, otherErrors, logError } = require('./errors');
const { send405Error } = require('./errors');

app.use(express.json());

app
  .route('/api')
  .get((req, res, next) => {
    res.send({ endpoints: listEndpoints(app) });
  })
  .all(send405Error);
//ask tutor if this is the correct way to implement listEndpoints(app)

app.use('/api', apiRouter);

app.all('/*', (req, res, next) => {
  next({ status: 404, msg: 'Route not found' });
});

app.use(psqlErrors);
app.use(otherErrors);
app.use(logError);

module.exports = app;
