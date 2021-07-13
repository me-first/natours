const mongoose = require('mongoose');

const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Reviews is neccessary']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    createdAt: {
      type: Date,
      default: Date.now()
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to tour']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

//Preventing duplicate review

reviewSchema.index({ tour: 1, user: 1 }, { unique: true }); //sets unique property for both

reviewSchema.pre(/^find/, function(next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name'
  // }).populate({
  //   path: 'user',
  //   select: 'name photox'
  // });

  //this represents Review.find() i.e. query object

  this.populate({
    path: 'user',
    select: 'name photo'
  });
  next();
});

// 1) with tour id cal avg rating and number of rating exist in that current tour
// 2) update the corresponding tour document
// 3) middleware to call this function when there is new or update review

reviewSchema.statics.calcAverageRatings = async function(tourId) {
  // this points to current review model
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }
    },
    {
      $group: {
        _id: '$tour',
        numOfRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  // console.log(stats);
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].numOfRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5
    });
  }
};

reviewSchema.post('save', async function() {
  // this points to current review
  //constructor is the model who created this document i.e. Review
  //this.tour gives the id of the tour from route on which we want to create review
  this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate
//findByIdAndDelete

//Hack
/*
reviewSchema.pre(/^findOneAnd/, async function(next) {
  //here this keyword is current query i.e. Review.findOneAndUpdate()
  //to get the review document we first execute query then it will gives the current review document
  this.rev = await this.findOne();

  // console.log(this.rev);

  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  //await this.findOne() doesnot work here, query has already executed
  await this.rev.constructor.calcAverageRatings(this.rev.tour);
});

*/

reviewSchema.post(/^findOneAnd/, function(doc, next) {
  if (!doc) {
    next();
  }
  doc.constructor.calcAverageRatings(doc.tour);
  next();
});
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
