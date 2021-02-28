require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
var mongo = require('mongodb');
var bodyParser = require('body-parser');
const shortid = require('shortid');

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));
 
app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

let shortUrlSchema = new mongoose.Schema({
  short_url: String,
  original_url: String,
  suffix: String
})

const ShortURl = mongoose.model('ShortURl', shortUrlSchema);

app.post('/api/shorturl/new/', function (req, res) {
  let clientRequestedUrl = req.body.url;
  let shortened = shortid.generate();

  let newUrl = new ShortURl({
    short_url: __dirname + "/api/shorturl/" + shortened,
    original_url: clientRequestedUrl,
    suffix: shortened
  })

  newUrl.save(function(err, data) {
    if (err) return console.log(err)
    return data;
  })

  res.json({
    "shortened_url": newUrl.short_url,
    "original_url": newUrl.original_url,
    "suffix": newUrl.suffix
  })
})

app.get("/api/shorturl/:suffix", function(req, res) {
  let userGeneratedSuffix = req.params.suffix;
  ShortURl.find({suffix: userGeneratedSuffix}).then(function (foundUrls) {
    let urlForRedirect = foundUrls[0]
    console.log(urlForRedirect.original_url)
    res.redirect(urlForRedirect.original_url)
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
