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


mongoose.connect(database_uri, 
{ 
  useNewUrlParser: true, 
  useUnifiedTopology: true
});

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

    // URL Shortener Project
  
    app.use(bodyParser.urlencoded({extended: false}));
  // Build a Schema and model to store saved URLs

  const links = [];
  let id = 0;

  app.post('/api/shorturl/new', function (req, res)
  {
    console.log('body', req.body);
    const { url } = req.body;
    const noHTTPSurl = url.replace(/^https?:\/\//, '');

    //check if this valid
    dns.lookup(noHTTPSurl, function (err)
    {
      if(err)
      {
        return res.json({
            "error" : "invalid URL" 
          });
      }else 
      {
        //increment id
        id++

        //create entry to our array
        const link = 
        {
          original_url: url,
          short_url: id.toString()
        };

        links.push(link);

        console.log(links);

        //return this new entry
          return res.json(link)
      }
    });
  });

  app.get('/api/shorturl/:id', function (req, res)
  {
    const { id } = req.params;

    console.log('id from query', id );

    const link = links.find(l => l.short_url === id)

    console.log('link found', link);

    if(link){
      return res.redirect(link.original_url);
    }else{
      return res.json({
        error: 'No Short URL'
      });
    }
  });

// listen for requests :)
var listener = app.listen(port, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
