// server.js
// where your node app starts

// DataBase URI

var database_uri = 'mongodb+srv://RatHead:admin123@clushead.t9tw1.mongodb.net/<ClusHead>?retryWrites=true&w=majority'

// init project
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var mongo = require('mongodb');
var mongoose = require('mongoose');
var shortid = require('shortid');
const dns = require('dns');
var port = process.env.PORT || 3000

// connecting to mongodb
let uri = 'mongodb+srv://RatHead:admin123@clushead.t9tw1.mongodb.net/ClusHead?retryWrites=true&w=majority'
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });

// using bodyParser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json())

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));



// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

app.get("/timestamp", function (req, res) {
  res.sendFile(__dirname + '/views/timestamp.html');
});

app.get("/requestHeaderParser", function (req, res) {
  res.sendFile(__dirname + '/views/requestHeaderParser.html');
});

app.get("/urlshortenermicroservices", function (req, res) {
  res.sendFile(__dirname + '/views/urlshortenermicroservices.html');
});

app.get("/exercisetracker", function (req, res) {
  res.sendFile(__dirname + '/views/exercisetracker.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  console.log({greeting: 'hello API'});
  res.json({greeting: 'hello API'});
});

//Timestamp Project
app.get("/api/timestamp", function(req, res)
{
  var now = new Date()
  res.json({
    "unix" : now.getTime(),
    "utc": now.toUTCString()
  });
});

app.get("/api/timestamp/:date_string", function(req,res)
{
  let dateString = req.params.date_string;  
  let passedInValue = new Date(dateString);

  if (parseInt(dateString) > 10000)
  {
    let unixTime = new Date(parseInt(dateString));
    res.json({
      "unix": unixTime.getTime(),
      "utc": unixTime.toUTCString()
    });
  }

  

  if(passedInValue == "Invalid Date")
  {
    res.json({"error" : "Invalid Date"});
  }else
  {
    res.json({
      "unix": passedInValue.getTime(),
      "utc": passedInValue.toUTCString()
    })
  }
});

// Header Request Project
app.get("/api/whoami", function(req, res)
  {
    res.json
    ({
      "ipaddress": req.connection.remoteAddress,
      "language": req.headers["accept-language"],
      "software": req.headers["user-agent"]
    });
  });

    /* Database Connection */


let urlSchema = new mongoose.Schema({
  original : {type: String, required: true},
  short: Number
})

let Url = mongoose.model('Url', urlSchema)

let responseObject = {}
app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }) , (request, response) => {
  let inputUrl = request.body['url'];
  
  let urlRegex = new RegExp(/^https?:\/\//, '');
  
  if(!inputUrl.match(urlRegex)){
    response.json({error: 'Invalid url'});
    return;
  }
    
  responseObject['original_url'] = inputUrl
  
  let inputShort = 1
  
  Url.findOne({})
        .sort({short: 'desc'})
        .exec((error, result) => {
          if(!error && result != undefined){
            inputShort = result.short + 1
          }
          if(!error){
            Url.findOneAndUpdate(
              {original: inputUrl},
              {original: inputUrl, short: inputShort},
              {new: true, upsert: true },
              (error, savedUrl)=> {
                if(!error){
                  responseObject['short_url'] = savedUrl.short;
                  response.json(responseObject);
                }
              }
            )
          }
  });
  
});

app.get('/api/shorturl/:input', (request, response) => {
  let input = request.params.input
  
  Url.findOne({short: input}, (error, result) => {
    if(!error && result != undefined){
      response.redirect(result.original);
    }else{
      response.json('URL not Found');
    }
  });
});


  //Exercise Tracker

// 1

const users = [];

app.post('/api/exercise/new-user', function(req,res)
{
  const{username} = req.body;

  const newUser = 
  {
    username,
    _id: shortid.generate()
  }
  users.push(newUser);

  console.log(users);
  return res.json(newUser);
});

// 2

app.post('/api/exercise/users', function(req,res)
{
  return res.json(users);
});


//   // Not found middleware
// app.use((req, res, next) => {
//   return next({status: 404, message: 'not found'})
// })

// // Error Handling middleware
// app.use((err, req, res, next) => {
//   let errCode, errMessage

//   if (err.errors) {
//     // mongoose validation error
//     errCode = 400 // bad request
//     const keys = Object.keys(err.errors)
//     // report the first validation error
//     errMessage = err.errors[keys[0]].message
//   } else {
//     // generic or custom error
//     errCode = err.status || 500
//     errMessage = err.message || 'Internal Server Error'
//   }
//   res.status(errCode).type('txt')
//     .send(errMessage)
// });

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
