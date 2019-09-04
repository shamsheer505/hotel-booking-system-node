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
eval(fs.readFileSync('server-config.js')+''); // create http server in config file
const helmet = require('helmet');

app.use(bodyParser.urlencoded({ extended: false })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
app.use(cors());
app.use(helmet());
//app.use(expressValidator());


/**Helmet’s crossdomain middleware prevents Adobe Flash 
    and Adobe Acrobat from loading content on your site.  **/
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.noCache());
// Sets "Referrer-Policy: no-referrer".
app.use(helmet.referrerPolicy());

app.use(function (req, res, next) { 
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");      
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
    res.header("Feature-Policy", "geolocation none;midi none;notifications none;push none;sync-xhr none;microphone none;camera none;magnetometer none;gyroscope none;speaker self;vibrate none;fullscreen self;payment none;");
    //res.removeHeader('Content-Encoding');    
    next();
});

app.all(['*server.js*', '*server-config.js*', '*config.json*', '*key.pem*', '*package.json*', '*bower.json*',
'*cMSSL.crt*', '*c2.crt*', '*c3.crt*', '*ssl.key*', '*Gruntfile.js*',
'*Dockerfile*', '*package-lock.json*', '*Public/**'], function (req, res, next){
  res.status(404).send({
     message: 'Not Found'
  });
});

app.all(['/var/*','/etc/*','/bin/*','/boot/*','/dev/*','/home/*','/lib/*','/lib64/*','/lost+found/*',
  '/media/*','/mnt/*','/opt/*','/proc/*','/root/*','/run/*','/sbin/*','/snap/*','/srv/*','/sys/*',
  '/tmp/*','/usr/*',], function (req,res, next) {

  res.status(403).send({
     message: 'Access Forbidden'
  });

});

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

//API Routes
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
              var responseData = "";
              res.on('data', function (reply) {
                   responseData += reply;
               });
               res.on('end', function () {
            	   logger.info('API Request completed. Returning response');
                   httpRes.send(JSON.parse(responseData));
               })
    });
    req.on('error', function (error) {
    	       logger.info("Error occured while making room booking request for the UserId : "+httpReq.body.userId);
    	       httpRes.status(500);
               httpRes.json(['Unable to book rooms right now']);
    });
    req.write(data);
    req.end();
	    }catch(error){
             logger.error('error', 'unable to book room: '+error);
             httpRes.status(500);
             httpRes.json('unable to make API call');
	    }
});

app.post('/user-management/api/users',[check('userId').isLength({ min: 3 }),
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
              var responseData = "";
              res.on('data', function (reply) {
                   responseData += reply;
               });
               res.on('end', function () {
                   httpRes.send(JSON.parse(responseData));
               })
    });
    req.on('error', function (error) {
    	       logger.error('error', 'unable to add bonus points now : '+error);
    	       httpRes.status(500);
               httpRes.json(['error']);
    });
    req.write(data);
    req.end();
	    }catch(error){
             console.error('error', 'unable to add bonus points now : '+error);
             httpRes.status(500);
             httpRes.json('unable to make API call');
	    }
});


//Node server start

server.listen(config._port); //Read port from separate config file to maintain consistency in all the environments.
logger.info("server listening on port : "+config._port);


