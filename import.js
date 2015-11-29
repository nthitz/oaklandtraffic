var pgp = require('pg-promise')()
var fs = require('fs')
var _ = require('lodash')
var csv = require('csv-stream')
require('dotenv').load()

var db = pgp(process.env.PGCONNECTION)
var folder = './data/'

var filesToRead = []

db.tx(function(t) {
  return t.batch([
    t.none('DROP TABLE IF EXISTS sighting'),
    t.none('DROP TABLE IF EXISTS sighting_serial'),
    t.none('DROP TABLE IF EXISTS vehicle'),
    t.none('DROP TABLE IF EXISTS vehicle_serial'),
    t.none(`CREATE TABLE vehicle
      (
        id serial PRIMARY KEY,
        vrm text UNIQUE,
        number_sightings integer,
        starttime timestamp,
        endtime timestamp
      )
    `),
    t.none(`CREATE TABLE sighting
      (
        id serial PRIMARY KEY,
        vrm_id integer REFERENCES vehicle,
        location geography(POINT),
        time timestamp
      )`),
  ])
}).then(() => {
  console.log('success')
  readFolder()
}).catch((error) => {
  console.log(error)
})

function readFolder() {
  files = fs.readdirSync(folder)
  files = _.filter(files, (file) => { return file[0] !== '.' })
  console.log(files)
  filesToRead = files
  readFile()
}
function defaultErrorHandler(error) {
  console.log(error)
  throw error
}
var vehicleMapping = {}
function readFile() {
  var file = files.shift()
  console.log(file)
  var fileData = []
  var sharedDb = null
  var csvStream = csv.createStream({
    enclosedChar: '"'
  })
    .on('data', (datum) => {
      datum = normalizeData(datum)
      fileData.push(datum)
      if (fileData.length % 50000 === 0)
        console.log(fileData.length)
    })
    .on('end', () => {
      console.log('file read ' + fileData.length)
      insert()
    })
    function insert() {
      db.connect()
        .then((object) => {
          sharedDb = object
          parseDatum()
        })
    }
    function parseDatum() {
      var logging = fileData.length %  1000 === 0
      var data = fileData.shift()
      if (!data) {
        sharedDb.done()
        readFile()
      }
      if (vehicleMapping[data.vrm]) {
        insertSighting(data)
      } else {
        lookupVRM(data)
      }

      function lookupVRM(data) {
        sharedDb.oneOrNone('SELECT id FROM vehicle WHERE vrm=$1', [data.vrm])
          .then((result) => {
            if (result) {
              vehicleMapping[data.vrm] = result.id
              insertSighting(data)
            } else {
              insertVehicle(data)
            }
          }).catch(defaultErrorHandler)
      }

      function insertVehicle(data) {
        sharedDb.one(
          'INSERT INTO vehicle (vrm) VALUES ($1) returning id',
          [data.vrm]
        ).then((result) => {
          if (logging)
            console.log(data.vrm + ' vehicle inserted')
          vehicleMapping[data.vrm] = result.id
          insertSighting(data)
        }).catch(defaultErrorHandler)
      }

      function insertSighting(sighting) {
        sharedDb.one(
          `INSERT INTO sighting (vrm_id, location, time)
            VALUES ($1,
              ST_SetSRID(ST_MakePoint(
                ${sighting.latitude}, ${sighting.longitude}
              ), 4326),
              $2)
            RETURNING id
          `,
          [
            vehicleMapping[sighting.vrm],
            sighting.timestamp
          ]
        ).then((result) => {
          if (logging) {
            console.log('sighting inserted ', result.id, new Date())
          }
          parseDatum()
        })
        .catch(defaultErrorHandler)
      }
    }
  fs.createReadStream(folder + file)
    .pipe(csvStream)
}

function normalizeData(data) {
  var object = {}
  var fields = [
    { type: 'vrm', value: 'red_vrm' },
    { type: 'vrm', value: 'red_VRM' },
    { type: 'timestamp', value: 'red_Timestamp' },
    { type: 'location', value: 'Location 1' },
  ]
  fields.forEach((field) => {
    if (typeof data[field.value] !== 'undefined') {
      object[field.type] = data[field.value]
    }
  })
  var locationRE = /\((-?[0-9.]+), (-?[0-9.]+)\)/
  var location = object.location.match(locationRE)
  if (location) {
    object.latitude = +location[1]
    object.longitude = +location[2]
  } else {
    console.log('error matching location')
    console.log(data)
  }
  if (!object.vrm || !object.timestamp || !object.location) {
    console.log(data)
    throw new Error('object missing property')
  }
  return object
}
