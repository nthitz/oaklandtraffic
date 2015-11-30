import d3 from 'd3'
import _ from 'lodash'
import L from 'leaflet'

import leafletcss from '../node_modules/leaflet/dist/leaflet.css'

d3.json('/vehicles', loadVehicles)
var vehicles = null
let vehicleSelect = d3.select('#vehicleSelect')
let map = null
initMap()

function initMap() {
  let d3map = d3.select('#map')
  let mapHeight = 600
  d3map.style('height', mapHeight + 'px')
  map = L.map('map').setView([-122.2544253, 37.8089782], 14)
  L.tileLayer('http://tile.stamen.com/toner/{z}/{x}/{y}.png')
    .addTo(map)

}

function loadVehicles(error, _vehicles) {
  vehicles = _vehicles
  console.log(vehicles)

  let options = vehicleSelect.selectAll('option').data(vehicles)
  options.enter().append('option')
  options.attr('value', (vehicle) => {
    return vehicle.id
  }).text((vehicle) => {
    return `${vehicle.vrm} (${vehicle.number_sightings})`
  })

  vehicleSelect.on('change', requestVehicleData)

  requestVehicleData()
}

function requestVehicleData() {
  let selectNode = vehicleSelect.node()
  let vehicleId = selectNode.options[selectNode.selectedIndex].value

  console.log(vehicleId)
}