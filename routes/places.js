const placesController = require('../controllers/places')
const express = require('express')
const router = express.Router()

router.get('/:pid', placesController.getPlaceById)
router.get('/user/:uid', placesController.getPlacesByUserId)
router.post('/', placesController.postPlace)
router.patch('/:pid', placesController.updatePlace)
router.delete('/:pid', placesController.deletePlace)

module.exports = router
