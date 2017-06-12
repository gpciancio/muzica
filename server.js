'use strict'
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const dbapi = require('./routes/dbapi.js');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(morgan());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use('/dbapi', dbapi);
app.get('/', (req, res, next)=>{
  res.send('hello world');
});
app.use('/', (req,res,next)=>{
  res.sendStatus(404);
});


app.listen(port, ()=>{
  console.log('listening on ', port);
});