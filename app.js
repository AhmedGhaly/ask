const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const helmet = require('helmet')

const app = express();


const answerRouter = require('./routes/answer')
const authRouter = require('./routes/auth')
const userRouter = require('./routes/user')



app.use(bodyParser.json())
app.use(logger('dev'));
app.use(express.json());
app.use(helmet())
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

// allow to send data out form anther port
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});

// routers
app.use(answerRouter)
app.use('/auth', authRouter)
app.use('/user', userRouter)

//error handling

app.use((req, res, next) => {
  const err = new Error('this page is not found')
  err.statusCode = 404
  next(err)
})

app.use((err, req, res, next) => {
  const status = err.statusCode || 500
  res.status(status).json({
    message : err.message,
    data : err.data
  })
})



module.exports = app;
