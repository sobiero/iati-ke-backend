var express = require('express')
var router = express.Router()
var IatiController = require('../controllers/Iati.js')
var multer = require('multer'); 
var upload = multer(); 

router.get('/test', (req, res, next) => {
   IatiController.welcomeMsg(req, res, next)
});

router.get('/sdg', (req, res, next) => {
   IatiController.getSdgs(req, res, next)
   
});

router.get('/county', (req, res, next) => {
   IatiController.getCounty(req, res, next)
   
});

router.get('/trans-type', (req, res, next) => {
   IatiController.getTransType(req, res, next)
   
});

router.get('/date-range', (req, res, next) => {
   IatiController.getDateRange(req, res, next)
   
});

router.get('/dashboard-data', (req, res, next) => {
   IatiController.getDashboardData(req, res, next)

   console.log( req.headers ); 
   
});

router.get('/county-location-data', (req, res, next) => {
   IatiController.getCountyLocationTotalAmt(req, res, next)
   
});

module.exports = router
