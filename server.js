const express    = require('express'),
      app        = express()
      bodyParser = require('body-parser'),
      // multer     = require('multer'),
      // mongoose   = require('./models/mongoose')
 
//app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
     
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.set('trust proxy', true);

app.use(require('./routes'));

app.get('/api', (req, res) => {
  res.json('Hello From CRUD Api')
});

app.listen(10015, () => {
  console.log('listening on 10015..')
});
