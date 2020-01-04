const HttpError = require('../models/http-error')
const uuid = require('uuid/v4')
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location')

let DUMMY_PLACES = [
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
    const places = DUMMY_PLACES.filter(p => p.id === pid)
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

const postPlace = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty())
        throw new HttpError('Invalid inputs passed, please check your data', 422)

    const {title, description, address, creator} = req.body

    let location
    try {
        location = await getCoordsForAddress(address)
    } catch (e) {
        return next(e)
    }

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
    const error = validationResult(req)
    if (!error.isEmpty())
        throw new HttpError('Invalid inputs passed, please check your data', 422)

    const {title, description} = req.body
    const {pid} = req.params

    const index = DUMMY_PLACES.findIndex(p => p.id === pid)

    if (index === -1) {
        throw new HttpError('PlaceId could not be found', 404)
    }

    const actualPlace = DUMMY_PLACES[index]
    const updatedPlace = {...actualPlace, title, description}

    DUMMY_PLACES[index] = updatedPlace

    res
        .status(201)
        .json({
            message: 'Place updated successfully',
            place: updatedPlace
        })
}

const deletePlace = (req, res, next) => {
    const {pid} = req.params

    const index = DUMMY_PLACES.findIndex(p => p.id === pid)
    if (index === -1)
        throw new HttpError('PlaceId could not be found', 404)

    DUMMY_PLACES = DUMMY_PLACES.filter(p => p.id !== pid)

    res
        .status(200)
        .json({
            message: 'Place deleted successfully'
        })
}

exports.getPlaceById = getPlaceById
exports.getPlacesByUserId = getPlacesByUserId
exports.postPlace = postPlace
exports.updatePlace = updatePlace
exports.deletePlace = deletePlace
