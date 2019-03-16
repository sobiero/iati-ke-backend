var express = require('express')
var router = express.Router()
var mongoose = require('mongoose')
var UserController = require('../controllers/User.js')
var multer = require('multer'); 
var upload = multer(); 

router.get('/test', (req, res, next) => {
   UserController.welcomeMsg(req, res, next)
});
/*
router.get('/add', (req, res, next) => {
   UserController.add(req, res, next)
   
});
*/
router.get('/', (req, res, next) => {
   UserController.findAll(req, res, next)
   
})

router.get('/:id', (req, res, next) => {
   UserController.findById(req, res, next)
   
})
router.post('/', upload.array(), (req, res, next) => {
   
    UserController.add(req, res, next)
   
})

router.put('/:id', upload.array(), (req, res, next) => {
   
   UserController.update(req, res, next)
   
})

router.delete('/:id', (req, res, next) => {
   UserController.remove(req, res, next)
   
})

module.exports = router
