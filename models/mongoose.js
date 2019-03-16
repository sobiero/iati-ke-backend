var mongoose = require('mongoose'),
    config   = require('../config/app')

mongoose.connect( config.db.mongodb.url,  { useNewUrlParser: true } ).then(
          
	  () => {
		  console.log('Database connection is successful') 
	  },
	  
	  err => { 
		  console.log('Error when connecting to the database. '+ err)	  
	  }

)

module.exports = { mongoose, config }
