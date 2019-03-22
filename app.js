require('dotenv').config()

var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var routes = require("./routes/index");

const app = express();

mongoose.connect(
  // 'mongodb://localhost:27017/test',
  "mongodb+srv://furniture_app:29UJKJygIZNU4RGr@cluster0-i2avy.gcp.mongodb.net/harpah_app?retryWrites=true",
  { useNewUrlParser: true },
  function(err) {
      if(err) console.log(err);
  }
);
mongoose.set("useCreateIndex", true);
mongoose.set('useFindAndModify', false);

/**
 * Middleware
 */

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// catch 400
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(400).send(`Error: ${res.originUrl} not found`);
  next();
});

// catch 500
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send(`Error: ${err}`);
  next();
});

/**
 * Register the routes
 */

routes(app);

module.exports = app;
