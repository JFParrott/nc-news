exports.psqlErrors = (err, req, res, next) => {
  const psqlErrorCodes = {
    // '23502': {
    //   status: 400,
    //   message: 'Incorrect properties included'
    // },
    '22P02': {
      status: 400,
      msg: 'Bad request'
    }
    // '42703': {
    //   status: 400,
    //   message: 'Column does not exist'
    // }
  };
  if (psqlErrorCodes.hasOwnProperty(err.code)) {
    const { status, msg } = psqlErrorCodes[err.code];
    res.status(status).send({ msg });
  } else {
    next(err);
  }
};

exports.otherErrors = (err, req, res, next) => {
  if (err.status) res.status(err.status).send({ msg: err.msg });
};

exports.send405Error = (req, res, next) => {
  res.status(405).send({ msg: 'Method not allowed' });
};
