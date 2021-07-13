const mongoose = require('mongoose');

const dotenv = require('dotenv');

//GLOBALLY HANDLING UNCAUGHT ERROR
process.on('uncaughtException', err => {
  console.log('UNCAUGHT REJECTION 💥 Shutting Down...');
  console.log(err.name, err.message, err);
  process.exit(1);
});

const app = require('./app');

dotenv.config({ path: './config.env' });

const DB = 'mongodb+srv://vivekdb:<PASSWORD>@cluster0.0ksdi.mongodb.net/natours?retryWrites=true&w=majority'.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  //.connect(process.env.DATABASE_LOCAL,{
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => {
    // console.log(con.connections);
    console.log('DB connection successful');
  });

// console.log(app.get('env'));
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

//GLOBALLY HANDLING REJECTED PROMISE ERROR

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION 💥 Shutting Down...');
  console.log(err.name, err.message);

  //Shutting down server and then exit the process gracefully
  server.close(() => {
    process.exit(1); //0:success ; 1:fail
  });
});

// console.log(vivek); //vivek is not defined
