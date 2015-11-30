import d3 from 'd3'
import _ from 'lodash'
import L from 'leaflet'

import leafletcss from '../node_modules/leaflet/dist/leaflet.css'

d3.json('/vehicles', loadVehicles)
var vehicles = null
let vehicleSelect = d3.select('#vehicleSelect')
let map = null
let vehicleData = null
var markers = []

initMap()

function initMap() {
  let d3map = d3.select('#map')
  let mapHeight = 600
  d3map.style('height', mapHeight + 'px')
  map = L.map('map').setView([37.8089782, -122.2544253], 14)
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
  d3.json(`/vehicle/${vehicleId}`, loadVehicleData)
}

function loadVehicleData(error, _vehicleData) {
  if (error) { console.error(error) }
  vehicleData = _vehicleData
  console.log(vehicleData)

  markers.forEach((marker) => {
    map.removeLayer(marker)
  })

  var colorInterpolator = d3.interpolateHsl(
    'hsl(0, 80%, 50%)', 'hsl(180, 80%, 50%)'
  )
  let colorScale = d3.scale.linear()
    .domain([0, vehicleData.length])
    .range(['hsl(0, 80%, 50%)', 'hsl(360, 80%, 50%)'])
  vehicleData.forEach((sighting, index) => {
    console.log(index)
    console.log(colorInterpolator(index / vehicleData.length))
    let marker = L.circle([sighting.lat, sighting.long], 50, {

      color: colorInterpolator(index / vehicleData.length),
    })
    markers.push(marker)
    map.addLayer(marker)
  })

}