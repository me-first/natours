const AppError = require('../utilities/appError');

const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldDB = err => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}, Please use another value`;
  /*
  const message = `Duplicate field value: ${Object.values(err.keyValue).join(
    '. '
  )}, Please use another value`;
  */
  return new AppError(message, 400);
};
const handleValidationErrorDB = err => {
  const message = Object.values(err.errors)
    .map(el => el.message)
    .join('. ');
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please login again!', 401);
const handleJWTExpired = () =>
  new AppError('Your token has expired,Please login again', 401);

const sendErrorDev = (err, req, res) => {
  //API
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack
    });
  }

  //RENDER WEBSITE
  console.log('ERROR💥💥', err);
  return res
    .status(err.statusCode)
    .render('error', { title: 'Something went wrong', msg: err.message });
};
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith('/api')) {
    // 1)Operational, trusted error: send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
      //Programming or other unknown error: don't leak error details
    }
    // 1 Log error
    console.error('ERROR💥', err);
    //2 Sending generic message
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }

  //RENDER WEBSITE
  // 1)Operational, trusted error: send message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something Went Wrong',
      msg: err.message
    });
    //Programming or other unknown error: don't leak error details
  }
  // 1 Log error
  console.error('ERROR💥', err);
  //2 Sending generic message
  return res.status(err.statusCode).render('error', {
    title: 'Something Went Wrong',
    msg: 'Please Try Again Later 💥'
  });
};

//GLOBAL ERROR HANDLING MIDDLEWARE
module.exports = (err, req, res, next) => {
  // console.log(err.stack); in which function error happens or gives address of error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err }; //making hard copy of error object coming from mongoDB
    error.name = err.name;
    error.code = err.code;
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error); //get tour with invalid ID
    if (error.code === 11000) error = handleDuplicateFieldDB(error); //create Tour with same name
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error); //TourSchema
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpired();

    sendErrorProd(error, req, res);
  }
  // next();
};
