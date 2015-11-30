var express = require('express');
var pgp = require('pg-promise')()
require('dotenv').load()
var webpack = require('webpack')
var webpackMiddleware = require("webpack-dev-middleware");
var webpackConfig = require('../webpack.config')

var db = pgp(process.env.PGCONNECTION)
var app = express();

var isProduction = process.env.NODE_ENV === 'production'

app.use(express.static('public'));

if (!isProduction) {
  app.use(webpackMiddleware(webpack(webpackConfig)))
}

app.get('/vehicles', (request, response) => {
  db.many('SELECT * FROM vehicle WHERE number_sightings > 100 ORDER BY number_sightings DESC')
    .then((result) => {
      response.json(result)
    })
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
