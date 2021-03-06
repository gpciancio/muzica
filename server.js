'use strict'
const express = require('express');
const app = express();
const port = process.env.PORT || 8000;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const users = require('./routes/users.js');
const projects = require('./routes/projects.js');
const permissions = require('./routes/permissions.js');
const jwt = require('jsonwebtoken');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

app.use(morgan());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



//commented out; we'll finish this in the future...

//redirect for users with tokens
// app.use('/',(req,res,next)=>{
//   console.log(req.cookies);
//   console.log("hello");
//   if(req.cookies.token){
//     console.log("Line 29: true");
//     var token = req.cookies.token;
//     jwt.verify(token, 'secret', function(err, decoded) {
//       if(err){
//         console.log(err);
//         next()
//       }
//     console.log(decoded)
//     window.location.replace('/home.html')
//     // return res.redirect('../login')
//     // next()
//   });
//   }
//   next()
// })
app.use(express.static('public'));
app.use('/projects', projects);
app.use('/users', users);
app.use('/permissions', permissions);
app.use('/',(req,res,next)=>{
  var token = req.cookies.token;
  jwt.verify(token, 'secret', function(err, decoded) {
    if(err){
      console.log(err);
    }
});
  next()
})
app.use(express.static('private'));

app.get('/', (req, res, next)=>{
  res.send('hello world');
});
app.use('/', (req,res,next)=>{
  res.sendStatus(404);
});

app.listen(port, ()=>{
  console.log('listening on ', port);
});
