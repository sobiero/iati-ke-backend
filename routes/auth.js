var express = require('express')
var router = express.Router()
var UserController = require('../controllers/User.js')
// var passport = require('passport')
//var jwt = require('jsonwebtoken')

var multer = require('multer'); 
var upload = multer(); 

/*
var mongoose = require('mongoose')
var config = require('../config/app')
require('../config/passport')(passport);
*/

router.post('/login', upload.array(), (req, res, next) => {
   UserController.authenticate(req, res, next)
});

module.exports = router
