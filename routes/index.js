const express = require('express'),
     router = express.Router(),
     User = require('../models/User');

router.use('/api/user', require('./user'));

router.use('/api/auth', require('./auth'));

router.use('/api/iati', require('./iati'));


router.get('/api', (req, res ) => {
  res.json("Hello from Crud");
});

module.exports = router ;
