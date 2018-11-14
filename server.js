'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var cors = require('cors');
var bodyParser = require('body-parser');
var app = express();
var urlShort = require('./validate');
const { URL } = require('url');
const urlDB = process.env.MONGO_URI;
const urlSave = require('./db');
// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(urlDB,{ useNewUrlParser: true });


app.use(cors());

app.use('/', (req, res, next) => {
  console.log(`${req.method}, ${req.path} - ${req.ip}`);
  next();
});

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

  
// your first API endpoint... 
app.get("/api/shorturl/all", function (req, res) {
  urlSave.findAll(req, res);
});

app.get('api/shorturl/:url', function(req, res) {
  urlSave.getLongUrl(req.params.url, function(error, data) {
      if (error) {
      res.send('ERROR!');
    } else {
      res.redirect(data);
    }
  });
});

app.get('/api/shorturl/new', function(req, res) {
  var newLongUrl = req.body.url;
  
  urlShort.validateUrl(newLongUrl, function(error, url) {
    if(error) {
      console.error("Error: URL is not validated");
      console.error(error);
      res.json({error: 'invalid URL'});
    } else {
      urlSave.createNew(url, function(error, shortUrl){
        if(error) {
          console.error('Error: something went wrong in the database');
          console.error(error);
          res.send('Error in the database');
        } else {
          res.json({'original_url': url, 'short_url': shortUrl});
        }
      });
    }
   });
});

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});


app.listen(port, function () {
  console.log('Node.js listening ...');
});