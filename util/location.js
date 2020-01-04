const axios = require('axios')
const HttpError = require('../models/http-error')
const API_KEY = 'AIzaSyCY3pFbxLf6yi9_d6knrL-3gSudK7nHk0o'

async function getCoordsForAddress(address){
    const r = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${API_KEY}`)
    if (!r.data || r.data.status === 'ZERO RESULTS')
        throw new HttpError('Could not find location for the specified address', 422)

    return {...r.data.results[0].geometry.location}
}

module.exports = getCoordsForAddress
