const HttpError = require('../models/http-error')
const mongoose = require('mongoose')
const { validationResult } = require('express-validator');
const getCoordsForAddress = require('../util/location')
const Place = require('../models/Place')
const User = require('../models/User')
const fs = require('fs')

const getPlaceById = async (req, res, next) => {
    const pid = req.params.pid

    let p
    try {
        p = await Place.findById(pid).exec() // To get a Promise
    } catch (e) {
        return next(new HttpError('Something went wrong, could not find the place', 500))
    }

    if (!p)
        return next(new HttpError('Cannot find Place with given id', 404))

    res.json({
        message: 'PlaceId successfully found',
        place: p.toObject({ getters: true })
    })
}

const getPlacesByUserId = async (req, res, next) => {
    const uid = req.params.uid

    let places
    try {
        places = await Place.find({creator: uid})
    } catch (e) {
        return next(new HttpError('Something went wrong, could not find places', 500))
    }

    if (!places || places.length < 1)
        return next (new HttpError('Cannot find Places for the given userId', 404))

    res.json({
        message: 'Successful request to PLACES :uid',
        places: places.map(p => p.toObject({getters: true}))
    })
}

const postPlace = async (req, res, next) => {
    const error = validationResult(req)

    if (!error.isEmpty())
        return next(new HttpError('Invalid inputs passed, please check your data', 422))

    const {title, description, address} = req.body

    let location
    try {
        location = await getCoordsForAddress(address)
    } catch (e) {
        return next(e)
    }

    const p = new Place({
        title,
        description,
        address,
        location,
        creator: req.userData.userId,
        imageUrl: req.file.path
    })

    let user
    try {
        user = await User.findById(req.userData.userId)
    } catch (e) {
        return next(new HttpError('Something went wrong while Creating Place. ' + e.message, 500))
    }

    if (!user) return next(new HttpError('Cannot find User for given Id', 404))

    let sess
    try {
        sess = await mongoose.startSession()
        await sess.startTransaction()
        await p.save({ session: sess })
        user.places.push(p)
        await user.save({ session: sess })
        await sess.commitTransaction()
    } catch (e) {
        await sess.abortTransaction();
        return next(
            new HttpError("Something went wrong while Creating Place. Probably Places collection has not been created manually, try db.createCollection('places')",
                500
            )
        )
    } finally {
        sess.endSession()
    }

    if (!user) {
        return next(new HttpError('We could not find place for UserId', 404))
    } else {

    }

    try {
        await p.save()
    } catch (e) {
        return next(new HttpError('Creating place failed, please try again', 500))
    }

    res
        .status(201)
        .json({
            message: 'Place created successfully',
            place: p
        })
}

const updatePlace = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty())
        return next(new HttpError('Invalid inputs passed, please check your data', 422))

    const {title, description} = req.body
    const {pid} = req.params

    let p
    try {
        p = await Place.findById(pid)
        if (!p) {
            return next(new HttpError('Could not find related Place', 404))
        } else {
            if (p.creator == req.userData.userId) {
                p.title = title
                p.description = description
                p.save()
            } else {
                return next(new HttpError('You do not have necessary permissions to update this place', 401))
            }
        }
    } catch (e) {
        return next(new HttpError('Place could not be updated, ' + e.message, 500))
    }

    res
        .status(201)
        .json({
            message: 'Place updated successfully',
            place: p.toObject({ getters: true })
        })
}

const deletePlace = async (req, res, next) => {
    const {pid} = req.params

    let p
    let imagePath
    try {
        p = await Place.findById(pid).populate('creator')
        imagePath = p.imageUrl
        if (p) {
            // Or p.creator.toString() === req.userData.userId
            if (p.creator._id == req.userData.userId) {
                const session = await mongoose.startSession()
                session.startTransaction()
                await p.remove({session})
                p.creator.places.pull(p) // Will remove the ID We had in the Places Array
                await p.creator.save({session})
                await session.commitTransaction()
            } else {
                return next(new HttpError('You do not have necessary permissions to delete this place', 401))
            }
        } else {
            return next(new HttpError('Could not find related Place', 404))
        }
    } catch (e) {
        return next(new HttpError('Place could not be deleted successfully, ' + e.message, 500))
    }

    fs.unlink(imagePath, err => {
        console.log('fs.unlink, error: ', err)
    })

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
