//User Controller
var User    = require('../models/User')
var express = require('express')
var router  = express.Router()
var passport = require('passport')
var jwt = require('jsonwebtoken')
var config = require('../config/app')
require('../config/passport')(passport);

const welcomeMsg = (req, res, next) => {
    res.json ( {'http-status': 200, msg: 'ok', 'data': "Hello from CRUD User"} )
}    

const findAll = (req, res, next) => {

    var skip    = parseInt( (req.query.page_number - 1 )) * parseInt( req.query.page_length) 
    var limit   = parseInt( req.query.page_length );
    var sortBy  = req.query.sort_by ;
    var sortDir = req.query.sort_dir == 'asc' ? 1 : -1 ;

    var sortObj = {}; 
    if ( typeof req.query.sort_dir != 'undefined' )
    {
      sortObj[sortBy] = sortDir;
    }
    
    var resp = {}
    User.find({}, {}, {skip: skip, limit: limit, sort:  sortObj  }, (err, data) => {
        if(err) {
            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting users' + err.message, 'data':data }
        } else {

             User.countDocuments({}, (err, count) => {
               resp = {'http-code': 200, 'http-status': 'success', 'msg': 'ok', 'data':data, 'count': count }
               res.json(resp);
            });

        }
        
   })

}

const findById = (req, res, next) => {
    var userId = req.params.id
    var resp = {}
    User.findById( userId, (err, user) => {
        if(err) {
            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':user }
        } else {
            resp = {'http-code': 200, 'http-status': 'success', 'msg': 'ok', 'data':user }
        }
        res.json(resp);
   })

}

const add = (req, res, next) => {

    var resp = {}
    var user = new User()

    var formUser = JSON.parse(req.body.user);

    user.first_name   = formUser.first_name
    user.last_name    = formUser.last_name
    user.national_id  = formUser.national_id
    user.dob          = formUser.dob
    user.username = formUser.username
    user.password = formUser.password
    
    if (formUser.username != '')
    {
       
    }

    if (formUser.password != '')
    {
       
    }

    user.save({}, (err) => {
        if(err) {
            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error saving user! ' + err.message, 'data':'' }
        } else {
            resp = {'http-code': 200, 'http-status': 'success', 'msg': 'user saved', 'data':'' }
        }

        res.json(resp);
    })

}

const update = (req, res, next) => {
    var userId = req.params.id
    var resp = {}

    User.findById( userId, (err, data) => {
        if(err) {
            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':data }
            res.json(resp)

        } else {
            
            User.findById( userId, (err, user) => {

            if(err) {
                
                resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':user }
                res.json(resp)
            
            } else {

                var formUser = JSON.parse(req.body.user);
                
                user.first_name   = formUser.first_name
                user.last_name    = formUser.last_name
                user.national_id  = formUser.national_id
                user.dob          = formUser.dob

                if (formUser.username != '')
                {
                  user.username = formUser.username                 
                }

                if (formUser.password != '')
                {
                  user.password = formUser.password                   
                }

                user.save({}, (err) => {
                if(err) {
                    resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error updating user! ' + err.message, 'data':'' }
                } else {
                    resp = {'http-code': 200, 'http-status': 'success', 'msg': 'user updated', 'data':'' }
                }
                    res.json(resp)
                
                })

            }

            })    
            
        }

   })

}

const remove = (req, res, next) => {
    var userId = req.params.id
    var resp = {}
    User.findById( userId, (err, data) => {
        if(err) {
            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':data }
            res.json(resp)
        
        } else {
            
            User.findById( userId, (err, user) => {
            
                if(err) {
                    
                    resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':user }
                    res.json(resp)
                
                } else {
                     
                    user.remove( { _id: userId }, (err) => {

                        if(err) {
                            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error deleting user! ' + err.message, 'data':'' }
                        } else {
                            resp = {'http-code': 200, 'http-status': 'success', 'msg': 'user deleted', 'data':'' }
                        }
                        
                        res.json(resp)
                    
                    })

                }

            })    
            
        }

   })

}

const authenticate = (req, res, next) => {
    var userId = req.params.id
    var resp = {}
    
    var formUser = JSON.parse( req.body.user );
    
    //console.log( formUser );
    //res.json({});

   
    User.findOne({
       username: formUser.username
    }, function(err, user) {
      if (err) throw err;

      if (!user) {
        res.status(401).json({success: false, msg: 'Authentication failed. User not found.'});
      } else {
        // check if password matches
        user.comparePassword(formUser.password, function (err, isMatch) {
          if (isMatch && !err) {
            // if user is found and password is right create a token
            var token = jwt.sign(user.toJSON(), config.passport.secret);
            // return the information including token as JSON
            res.json({success: true, token: 'JWT ' + token});
          } else {
            res.status(401).json({success: false, msg: 'Authentication failed. Wrong password.'});
          }
        });
      }
    });


    /*
    User.findById( userId, (err, data) => {
        if(err) {
            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':data }
            res.json(resp)
        
        } else {
            
            User.findById( userId, (err, user) => {
            
                if(err) {
                    
                    resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error getting user data. ' + err.message, 'data':user }
                    res.json(resp)
                
                } else {
                     
                    user.remove( { _id: userId }, (err) => {
                        if(err) {
                            resp = {'http-code': 501, 'http-status': 'error', 'msg': 'error deleting user! ' + err.message, 'data':'' }
                        } else {
                            resp = {'http-code': 200, 'http-status': 'success', 'msg': 'user deleted', 'data':'' }
                        }
                        
                        res.json(resp)
                    
                    })
                }
            })    
            
        }
   }) */

}

module.exports = {   
    welcomeMsg,
    findAll,
    findById,
    add,
    update,
    remove,
    authenticate
}
