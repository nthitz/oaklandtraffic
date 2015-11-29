var pgp = require('pg-promise')()
var _ = require('lodash')
require('dotenv').load()

var db = pgp(process.env.PGCONNECTION)
console.log('trying this query')

db.none(
  `WITH vrm_data as (
     SELECT
      vrm_id,
      MIN(time) as mintime,
      MAX(time) as maxtime,
      COUNT(id) as count
    FROM sighting
    GROUP BY vrm_id
  )
  UPDATE vehicle SET
    starttime=vrm.mintime,
    endtime=vrm.maxtime,
    number_sightings=vrm.count
  FROM vrm_data vrm
  WHERE id=vrm.vrm_id

  `
).then((results) => {
  console.log('result')
  console.log(results.length)
  result.forEach((result) => {

  })
}).catch(errorHandler)


function errorHandler(error) {
  console.log(error)
  throw new Error(error.toString())
}

