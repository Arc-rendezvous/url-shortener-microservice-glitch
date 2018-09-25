'use strict';

const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dns = require('dns');
const urlSave = require('./model/db');
const urlValidate = require('./bin/validate');
var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

var urlSchema = new mongoose.Schema({
  name: String,
  address: String,
  family: String
});

var NewUrl = mongoose.model('NewUrl', urlSchema);

app.use(cors());

/** this project needs to parse POST bodies **/
app.use(bodyParser.urlencoded({extended: false}));
app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/shorturl/:url", function (req, res) {
  urlSave.getLongUrl(req.params.url, function (err, data) {
    if (err) {
      res.error(err)
    } else {
      res.redirect(data) 
    }
  })
});

app.post("/api/shorturl/new", function (req, res) {
  const newLongUrl = req.body.url;
  urlValidate.validateUrl(newLongUrl, function (err, url) {
    if (err) {
      res.json({"error": "invalid URL"});
    } else {
      urlSave.createNew(url, function (err, shorturl) {
        if (err) {
          res.send('Database error');
        } else {
          res.json({original_url: newLongUrl, short_url: shorturl});
        }
      })
    }
  })
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});