const mongoose = require('mongoose');
const slugify = require('slugify');
// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour name must have minimum 10 character'],
      maxlength: [40, 'A tour name must have minimum 10 character']
      // validate: [validator.isAlpha, 'name must have alphabet']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: ['easy', 'medium', 'difficult']
    },

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'rating must be greater than 1.0'],
      max: [5, 'rating must be less than 5.0'],
      set: value => Math.round(value * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: [
        function(val) {
          //this only point to current document on New document creation
          return val < this.price; //100<200 (true) 250<200(false)-->err
        },
        'Discount price ({VALUE}) should be below the regular price'
      ]
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      //GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number], //[longitude,latitude]
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },

        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// tourSchema.index({ price: 1 });
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function() {
  return Math.floor(this.duration / 7);
});

//VIRTUAL POPULATE
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour', //in review model, the reference ID of tour model is stored in tour filed
  localField: '_id' //what is the name of that referece ID in tour(current) model
});

//DOCUMENT MIDDLEWARE: Runs before: .save(),.create() but not on insertMany()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); //this Schema or document object
  next();
});
/*
tourSchema.pre('save', function(next) {
  console.log('Will Save Document');
  next();
});
tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});
*/
//Embedding user document in tour Model
/*
tourSchema.pre('save', async function(next) {
  const guidesPromise = this.guides.map(async id => await User.findById(id));

  this.guides = await Promise.all(guidesPromise);

  next();
});
*/
//QUERY MIDDLEWARE: Runs after query object(query = Tour.find()) but before query get executed (tour = await query)

// tourSchema.pre(find, function(next) {
tourSchema.pre(/^find/, function(next) {
  //this keyword points to query object-we can chain all query method like find,sort etc
  this.find({ secretTour: { $ne: true } }); //this = query Object
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post(/^find/, function(docs, next) {
  // console.log(docs);
  console.log(`Query took to execute ${Date.now() - this.start} millis`);
  next();
});

/*
tourSchema.pre('findOne', function(next) {
  //this keyword points to query object-we can chain all query method like find,sort etc
  this.find({ secretTour: { $ne: true } });
  next();
});
*/

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });

//   console.log(this); //this = current aggregation object
//   next();
// });
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
