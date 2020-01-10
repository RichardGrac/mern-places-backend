const axios = require('axios')
const HttpError = require('../models/http-error')

async function getCoordsForAddress(address){
    const r = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`)
    if (!r.data || r.data.status === 'ZERO RESULTS')
        throw new HttpError('Could not find location for the specified address', 422)

    return {...r.data.results[0].geometry.location}
}

module.exports = getCoordsForAddress
