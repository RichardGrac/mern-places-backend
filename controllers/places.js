const HttpError = require('../models/http-error')
const uuid = require('uuid/v4')

const DUMMY_PLACES = [
    {
        id: 'p1',
        title: 'Empire State Building',
        description: 'A famous sky scraper',
        address: '20 W 34th St, New York, NY 10001',
        location: {
            lng: 123,
            lat: 40,
        },
        creator: 'u1'
    }
]

const getPlaceById = (req, res, next) => {
    const pid = req.params.pid
    const places = DUMMY_PLACES.filter(p => p.id == pid)
    console.log('pid: ', pid)
    console.log('places: ', DUMMY_PLACES)
    if (places.length < 1)
        return next(new HttpError('Cannot find Place with given id', 404))

    res.json({
        message: 'Successful request to PLACES',
        places
    })
}

const getPlacesByUserId = (req, res, next) => {
    const uid = req.params.uid
    const places = DUMMY_PLACES.filter(p => p.creator === uid)

    if (places.length < 1)
        throw new HttpError('Cannot find Places for the given userId', 404)

    res.json({
        message: 'Successful request to PLACES :uid',
        places
    })
}

const postPlace = (req, res, next) => {
    const {title, description, address, location, creator} = req.body

    const newPlace = {
        id: uuid(),
        title,
        description,
        address,
        location,
        creator,
    }

    DUMMY_PLACES.push(newPlace)

    res
        .status(201)
        .json({
            message: 'Place created successfully',
            place: newPlace
        })
}

const updatePlace = (req, res, next) => {
    const {title, description, address, location, creator} = req.body
    const {pid} = req.params

    const index = DUMMY_PLACES.findIndex(p => p.id == pid)

    if (index === -1) {
        throw new HttpError('PlaceId could not be found')
    }

    const updatedPlace = {
        id: DUMMY_PLACES[index].id,
        title,
        description,
        address,
        location,
        creator,
    }

    DUMMY_PLACES[index] = updatedPlace

    res
        .status(201)
        .json({
            message: 'Place updated successfully',
            place: updatedPlace
        })
}

const deletePlace = (req, res, next) => {
    
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.postPlace = postPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
