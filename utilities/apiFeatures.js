class APIFeatures {
  constructor(query, queryString) {
    // query means Tour.find() and queryString means req.query
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1A) Filtering
    const queryObj = { ...this.queryString };
    const excludeFields = ['page', 'sort', 'limit', 'fields'];
    excludeFields.forEach(el => delete queryObj[el]);

    //1B)Advance Filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    // console.log(JSON.parse(queryStr));

    //{ duration: { $gte:5 }, difficulty:'easy' } mongodb
    // { duration: { gte: '5' }, difficulty: 'easy' } req.query
    //gte,gt,lte,lt

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);

      this.query = this.query.sort(sortBy); //Query.prototype.sort()
      //sort('price ratingsAverage')
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
      // query = query.select('name duration price')
    } else {
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    // page=2&limit=10 means 1-10,page1 11-20,page2 21-30,page3 and so on
    this.query = this.query.skip(skip).limit(limit);
    // query = query.skip(20).limit(10) for page 3
    //query.sort().select().skip().limit()
    return this;
  }
}

module.exports = APIFeatures;
