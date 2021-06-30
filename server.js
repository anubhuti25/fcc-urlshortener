require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const url = require('url');
const shortid = require('shortid');
const validUrl = require('valid-url');

const { Schema } = mongoose; 

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const urlSchema = new Schema({
  original_url: String,
  short_url: String
});

let URL = mongoose.model('URL', urlSchema);

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: "false" }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/shorturl/:short_url', (req, res) => {
  const short_url  = req.params.short_url;
  URL.findOne({short_url: short_url}, (err,data) => {
    if(err) return res.status(500).send({msg: err.message});
    if(data) {
      return res.redirect(data.original_url)
    } else {
      res.status(404).json({ error: 'No URL found' })
    }
  });
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const original_url = req.body.url;
  console.log(req.body)
  if (validUrl.isUri(url)) {
    URL.findOne({original_url}, (err,data) => {
      if(err) return res.status(500).send({msg: err.message});
      if(data) {
        return res.json({original_url : data.original_url,short_url: data.short_url})
      } 
      const url = new URL({
        original_url: original_url,
        short_url: shortid.generate()
      });
      url.save((err, data) => {
        if (err) return res.status(500).send({ msg: err.message });
        res.json({ original_url: url.original_url, short_url: url.short_url });
      });
    })
  }
  else {
    res.json({ error: 'invalid url' })
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
