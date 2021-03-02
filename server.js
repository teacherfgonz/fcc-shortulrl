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

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

//Database

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let urlSchema = new mongoose.Schema({
  original : {type: String, required: true},
  short: {type: String}
});

let Url = mongoose.model('Url', urlSchema)

let responseObject = {}

app.post('/api/shorturl/new', bodyParser.urlencoded({ extended: false }) , (req, res) => {
  let inputUrl = req.body.url
  let urlRegex = new RegExp(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi)

  if(!inputUrl.match(urlRegex)) {
    res.json({error: 'invalid url'})
  }

  responseObject['original_url'] = inputUrl

  let newUrl = new Url({original: inputUrl, short: shortid.generate()})
  Url.findOne({original: inputUrl}, (err, foundUrl) => {
    if (!err && foundUrl === null) {
      newUrl.save((err, result) => {
        if (!err) {
          responseObject['short_url'] = result.short
          res.json(responseObject)
        } 
      })
    } if (!err && foundUrl != null) {
      responseObject.short_url = foundUrl.short
      res.json(responseObject)
    }
  })
})

app.get('/api/shorturl/:input', (req, res) => {
  let input = req.params.input
  
  Url.findOne({short: input}, (error, result) => {
    if (!error && result != null) {
      console.log(result)
      res.redirect(result.original)
    } else {
      res.json('URL not found')
    }
  })
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
})
