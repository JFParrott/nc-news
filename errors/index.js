exports.psqlErrors = (err, req, res, next) => {
  const psqlErrorCodes = {
    '23502': {
      status: 400,
      msg: 'Invalid input'
    },
    '23503': {
      status: 404,
      msg: 'Not found'
    },
    '22P02': {
      status: 400,
      msg: 'Bad request'
    },
    '42703': {
      status: 400,
      msg: 'Invalid input'
    }
  };
  if (psqlErrorCodes.hasOwnProperty(err.code)) {
    const { status, msg } = psqlErrorCodes[err.code];
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

exports.otherErrors = (err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.logError = (err, req, res, next) => {
  console.log(err);
  res.status(500).send('Internal Server Error');
};

exports.send405Error = (req, res, next) => {
  res.status(405).send({ msg: 'Method not allowed' });
};
