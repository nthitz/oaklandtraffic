var pgp = require('pg-promise')()
var fs = require('fs')
require('dotenv').load()

var db = pgp(process.env.PGCONNECTION)

console.log(db)
db.tx(function(t) {
  return t.batch([
    t.none('DROP TABLE IF EXISTS sighting'),
    t.none('DROP TABLE IF EXISTS sighting_serial'),
    t.none('DROP TABLE IF EXISTS vehicle'),
    t.none('DROP TABLE IF EXISTS vehicle_serial'),
    t.none(`CREATE TABLE vehicle
      (
        id serial PRIMARY KEY,
        vrm text UNIQUE
      )
    `),
    t.none(`CREATE TABLE sighting
      (
        id serial PRIMARY KEY,
        vrm_id integer REFERENCES vehicle,
        time timestamp
      )`),
  ])
}).then(() => {
  console.log('success')
}).catch((error) => {
  console.log(error)
})
