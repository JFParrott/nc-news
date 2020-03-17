exports.send405Error = (req, res, next) => {
  res.status(405).send({ msg: 'Method not allowed' });
};
