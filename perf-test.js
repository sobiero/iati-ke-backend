var pg      = require('./models/pgpromise')
var http = require("http")
var express = require('express')
var url = '/api/iati/dashboard-data?params=';
var app = express();

pg.pgDb.any(`SELECT dashboard_params FROM web.activity_log LIMIT 1 `, [true])
    .then(function(data) {
        //console.log(data);

        

        data.forEach(loadUrl);



        //res.json ( {'http-status': 200, msg: 'ok', 'data': data } )
    })
    .catch(function(error) {
        console.log(error);
        //res.json ( {'http-status': 503, msg: 'ok', 'data': error } )
    }); 

      
    function loadUrl(item, index) { 
       url += JSON.stringify(item.dashboard_params)
       console.log(url);

       const options = {
          //hostname: 'iati-ke.obierosimon.com',
          uri: 'http://iati-ke.obierosimon.com' + url,
          //port: 80,
          //path: url,
          method: 'GET',
          headers: {
            'browser_uuid': 'auto'
          }
        };

        const req = http.request(options, (res) => {
          console.log(`STATUS: ${res.statusCode}`);
          console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            console.log(`BODY: ${chunk}`);
          });
          res.on('end', () => {
            console.log('No more data in response.');
          });
        });

        req.on('error', (e) => {
          console.error(`problem with request: ${e.message}`);
        });

    }

   // process.exit();

