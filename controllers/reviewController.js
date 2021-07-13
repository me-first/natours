const Review = require('../models/reviewModel');
// const catchAsync = require('../utilities/catchAsync');
const factory = require('./handlerFactory');
// const AppError = require('../utilities/appError');

exports.setTourUserIds = (req, res, next) => {
  //Nested Routes

  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
