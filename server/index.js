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
  db.many('SELECT * FROM vehicle WHERE number_sightings > 100 ORDER BY number_sightings DESC LIMIT 50')
    .then((result) => {
      response.json(result)
    })
})

app.get('/vehicle/:id', (request, response) => {
  db.many(
    `SELECT time, ST_AsText(location) as location
    FROM sighting WHERE vrm_id=$1 ORDER BY time ASC`,
    [request.params.id]
  ).then((result) => {
    response.json(result.map((sighting) => {
      var o = {
        time: sighting.time,
      }
      var location = sighting.location
      var locationRE = /POINT\((-?[0-9.]+) (-?[0-9.]+)\)/

      var matches = location.match(locationRE)
      if (! matches) {
        console.error('invalid location')
        throw new Error('invalid location')
        return
      }
      o.long = +matches[1]
      o.lat = +matches[2]
      return o
    }))
  }).catch((error) => { console.log(error) })
})

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
