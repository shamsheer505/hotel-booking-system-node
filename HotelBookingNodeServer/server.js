// Set up
config = require('./config.json');
const express  = require('express');
const fs = require('fs');
const app = express();
const http = require('http');
const winston = require('winston');
const bodyParser = require('body-parser');
const cors = require('cors');
const { check, validationResult } = require('express-validator');
eval(fs.readFileSync('server-config.js')+'');

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(cors());
//app.use(expressValidator());

/* logger details */
logger = new (winston.Logger)({
    transports: [
        new (winston.transports.File)({
            name: 'info_file',
            filename: 'log_info.log',
            level: 'info'
        }),
        new (winston.transports.File)({
            name: 'error-file',
            filename: 'log_error.log',
            level: 'error'
        })
    ]
});

//Routes
app.post('/hotelbookingservice/api/rooms',[check('userId').isLength({ min: 3 }),
        check('roomCategory').not().isEmpty(),
        check('numberOfRooms').isNumeric()],(httpReq, httpRes) => {
	    try{
          logger.info('Hotel booking API called to book rooms for the UserId : '+httpReq.body.userId);
          const errors = validationResult(httpReq)
           if (!errors.isEmpty()) {
              return httpRes.status(422).json({ errors: errors.array() })
           }

          var data = JSON.stringify(httpReq.body);
          var req_options = {
           host : "localhost",
           port : "8082",
          path: '/hotelbookingservice/api/rooms',
          method : 'POST',
           headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
          };

           var req = http.request(req_options, function (res) {
              var datas = "";
              res.on('data', function (reply) {
            	  //console.log("Data !!!");
                   datas += reply;
               });
               res.on('end', function () {
            	   logger.info('API Request completed. Returning response');
                   httpRes.send(JSON.parse(datas));
               })
    });
    req.on('error', function (error) {
    	       logger.info("Error occured while making room booking request for the UserId : "+httpReq.body.userId);
    	       httpRes.status(500);
               httpRes.json(['Unable to book rooms right now']);
    });
    req.write(data);
    req.end();
        //  console.log(options);
           //httpRes.json(JSON.parse(datas));
        //   httpRes.json(options);
	    }catch(error){
             logger.error('error', 'unable to book room: '+error);
             httpRes.status(500);
             httpRes.json('unable to make API call');
	    }
});

app.post('/api/users',[check('userId').isLength({ min: 3 }),
        check('numberOfPoints').isNumeric()],(httpReq, httpRes) => {
	    try{
          var data = JSON.stringify(httpReq.body);
          console.log(data);
          var req_options = {
           host : "localhost",
           port : "8082",
          path: '/api/users',
          method : 'POST',
           headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
          };

           var req = http.request(req_options, function (res) {
              var datas = "";
              res.on('data', function (reply) {
            	  //console.log("Data !!!");
                   datas += reply;
               });
               res.on('end', function () {
            	   //console.log("Response End !!!");
            	   //console.log(datas);
            	   //.httpRes.status(datas.code);
                   httpRes.send(JSON.parse(datas));
               })
    });
    req.on('error', function (error) {
    	       logger.error('error', 'unable to add bonus points now : '+error);
    	       httpRes.status(500);
               httpRes.json(['error']);
    });
    req.write(data);
    req.end();
        //  console.log(options);
           //httpRes.json(JSON.parse(datas));
        //   httpRes.json(options);
	    }catch(error){
             console.error('error', 'unable to add bonus points now : '+error);
             httpRes.status(500);
             httpRes.json('unable to make API call');
	    }
});


//Node server start

server.listen(config._port);
logger.info("server listening on port : "+config._port);


