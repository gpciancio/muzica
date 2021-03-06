'use strict';
const express = require('express');
const router = express.Router();
const knex = require('../knex');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const secret = 'secret';


router.get('/', function(req,res,next){

  let token = req.cookies.token;
  jwt.verify(token, secret, function(err, value){
    if(err){
      return res.send('token doesnt match');
    }else{
      knex('projects')
      .where('project_owner', value.id)
      .then(function(projects){
        res.send(projects);
      });

    }
  });

});
router.get('/masters', function(req,res,next){
  knex('commits')
  .where('is_master', true)
  .then(function(masters){
    res.send(masters)
  })
});
router.patch('/masters/:projectId', function(req, res, next){
  knex('commits')
  .update('is_master', false)
  .where('project_id', req.params.projectId)
  .where('is_master', true)
  .returning('*')
  .then(function(updated){
    knex('commits')
    .update('is_master', true)
    .where('id', req.body.commitId)
    .then(function(){
      knex('commits')
      .where('project_id', req.params.projectId)
      .join('users', 'commits.submitted_by','=','users.id')
      .select(['commits.id','first_name', 'last_name', 'project_id', 'widget_url','submitted_by', 'is_master', 'sc_username','commit_comment'])
      .then(function(commits){
        res.send(commits);
      });
    });
  });
});

router.get('/:id', function(req, res, next){
  knex('commits')
  .where('project_id', req.params.id)
  .join('users', 'commits.submitted_by','=','users.id')
  .select(['commits.id','first_name', 'last_name', 'project_id', 'widget_url','submitted_by', 'is_master', 'sc_username','commit_comment'])
  .then(function(commits){
    res.send(commits);
  });
});
router.post('/', function(req, res, next){
    try{
    let token = req.cookies.token;
    jwt.verify(token, secret, function(err, userInfo){
      if(err){
        return res.send('you do not have access');
      }else{
      let needed = {
        project_owner: userInfo.id,
        project_title: req.body.projectTitle,
        project_description: req.body.projectDescription

      }
      knex('projects')
      .insert(needed)
      .returning('*')
      .then(function(added){
        res.send(added);
      });

      }
    });
  }
  catch(err){
  }
});
router.post('/commit', function(req, res, next){
  try{
  let token = req.cookies.token;
  jwt.verify(token, secret, function(err, userInfo){
    if(err){
      return res.send('you do not have access');

    }else{
      var widgeturl = "https://w.soundcloud.com/player/?url=https://soundcloud.com/"
      let needed = {
        project_id: req.body.projectId,
        commit_comment: req.body.comment,
        submitted_by: userInfo.id,
        widget_url: `${widgeturl}${userInfo.sc_username}/${req.body.track}`,
        is_master: req.body.is_master
      }
      if(req.body.is_master == 'true' || req.body.is_master == true){
        knex('commits')
        .update('is_master', false)
        .where('project_id', req.body.projectId)
        .where('is_master', true)
        .returning('*')
        .then(function(updated){
          knex('commits')
          .insert(needed)
          .returning('*')
          .then(function(addedCommit){
            knex('commits')
            .where('project_id', req.body.projectId)
            .join('users', 'commits.submitted_by','=','users.id')
            .select(['first_name', 'commits.id as id', 'last_name', 'project_id', 'widget_url','submitted_by', 'is_master', 'sc_username','commit_comment'])
            .then(function(commits){
              res.send(commits);
            });
          });
        });
      }else{
        knex('commits')
        .insert(needed)
        .returning('*')
        .then(function(addedCommit){
          knex('commits')
          .where('project_id', req.body.projectId)
          .join('users', 'commits.submitted_by','=','users.id')
          .select(['first_name', 'last_name','commits.id as id', 'project_id', 'widget_url','submitted_by', 'is_master', 'sc_username','commit_comment'])
          .then(function(commits){
            res.send(commits);
          });
        });
      }
    }
  });
  }
    catch(err){
    }

});
router.patch('/', function(req,res,next){
  try{
      let token = req.cookies.token;
      jwt.verify(token, secret, function(err, userInfo){
        if (err){
          return res.send('You do not have permission to be here')
        }else{
          let id = req.body.projectId;
          delete req.body.projectId;
          knex('projects')
          .update(req.body)
          .where('id', id)
          .returning('*')
          .then(function(changed){
            knex('projects')
            .where('project_owner', userInfo.id)
            .then(function(projects){
              res.send(projects);
            });
          })
        }
      });
  }catch(err){}
});
router.delete('/', function(req, res, next){
  try{

    let token = req.cookies.token
    jwt.verify(token, secret, function(err, userInfo){
      if (err){
        return res.send('you do not have permission')
      }else{
          knex('projects')
          .del()
          .where('id', req.body.projectId)
          .then(function(){
            knex('projects')
            .where('project_owner', userInfo.id)
            .then(function(projects){
              res.send(projects);
            });
          });
      }

    });

  }catch(err){
  }

});
router.delete('/commit', function(req, res, next){
  knex('commits')
  .del()
  .where('id', req.body.commit_id)
  .then(function(){
    knex('commits')
    .where('project_id', req.body.project_id)
    .join('users', 'commits.submitted_by','=','users.id')
    .select(['commits.id as id','first_name', 'last_name', 'project_id', 'widget_url','submitted_by', 'is_master', 'sc_username','commit_comment'])
    .then(function(commits){
      res.send(commits);
    });
  });
});



module.exports = router;
