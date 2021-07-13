class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; //all the error that we create ourselves

    Error.captureStackTrace(this, this.constructor); //(error object,AppError class)
  }
}

module.exports = AppError;
