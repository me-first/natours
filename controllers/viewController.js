const Tour = require('../models/tourModel');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');
const catchAsync = require('../utilities/catchAsync');
const AppError = require('../utilities/appError');

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) Get tour data
  // 2) Build and render overview template
  // 3) Fill that template with tour data
  const tours = await Tour.find();

  res.status(200).render('overview', {
    title: 'All tours',
    tours
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // 1) get data for the requested tour along with reviews and tourguides

  const { slug } = req.params;
  const tour = await Tour.findOne({ slug: slug }).populate({
    path: 'reviews',
    select: 'review rating user'
  });
  // 2) Build pug template
  // 3) Fill and render the template with tour data from 1)
  if (!tour) return next(new AppError('There is no tour with that name.', 404));
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour
  });
});

exports.getLogin = (req, res) => {
  res.status(200).render('login', {
    title: 'Login to your account'
  });
};

exports.getMe = (req, res) => {
  res.status(200).render('me', { title: 'Your account' });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
  // 1) Find our bookings
  const bookings = await Booking.find({ user: req.user.id }); //array because user can book many tours

  // 2) Find tours from our bookings
  const tourIds = bookings.map(booking => booking.tour);

  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render('overview', {
    title: 'Your Bookings',
    tours
  });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    { new: true, runValidators: true }
  );
  res.status(203).render('me', {
    title: 'Your account',
    user: updatedUser
  });
});
