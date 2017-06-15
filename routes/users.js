'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const path = require("path");
const jwt = require('jsonwebtoken');
const saltRounds = 8;
// const humps = require('humps');


router.post('/login', (req, res, next) => {
  console.log(req.body);
  // console.log('line12');
  knex('users')
    .select('*')
    .where('email', req.body.email)
    .first()
    .then(function(user) {
      console.log(user);
      console.log("search result from db",user);
      if (Object.keys(user).length === undefined) {
        console.log("right here");
        res.setHeader('Content-Type', 'text/plain');
        res.send("Incorrect email or password");
      } else {
        bcrypt.compare(req.body.password, user.hashed_password, function(err, decode) {
          // console.log(decode);
          // console.log('line25');
          if (err) {
            return res.send('Invalid email or password')
          } else if (decode===true){

            var token = jwt.sign(user, 'secret');
            // console.log(token);
            res.cookie('token', token, {
              httpOnly: true
            });
            // console.log(req.cookies);
            // console.log(user.id);
            // knex('projects')
            //   .select('*')
            //   .where('user_id', 'user.id')
            //   .then(projects => {
            //     console.log(projects);
            // console.log("ready to redirect");
              // return res.redirect('/home.html')
                return res.send(true)

            //     // res.sendFile(path.join( __dirname+'/home.html'));
            //   })
          }else{
            return res.send(false)
          }
        });
      }
    });
});

router.post('/createuser', (req, res, next) => {
  // console.log(req.body);
  knex('users')
    .select('*')
    .where('email', req.body.email)
    .then(function(user) {
      // console.log(user);
      if (Object.keys(user).length > 0) {
        console.log("line 66 email already exists");
        res.setHeader('Content-Type', 'text/plain');
        return res.send("Invalid email, already taken");
      } else {
        bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
          if (err) {
            res.send(err)
          } else {
            req.body.hashed_password = hash
            delete req.body.password
            knex('users')
              .returning('*')
              .insert(req.body)
              .then(new_user=>{
                console.log(new_user);
                return res.send(new_user)
              })
          }
        });
      }
    });
});

router.get('/logout',(req,res,next)=>{
  res.clearCookie('token');
  res.send(true)
})

module.exports = router;
