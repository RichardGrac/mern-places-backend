const placesController = require('../controllers/places')
const express = require('express')
const router = express.Router()
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')
const checkAuth = require('../middleware/check-auth.js')

// Public routes
router.get('/:pid', placesController.getPlaceById)
router.get('/user/:uid', placesController.getPlacesByUserId)

// Private routes
router.use(checkAuth)

router.post(
    '/',
    fileUpload.single('image'),
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
        check('address').not().isEmpty(),
    ],
    placesController.postPlace
)
router.patch(
    '/:pid',
    [
        check('title').not().isEmpty(),
        check('description').isLength({min: 5}),
    ],
    placesController.updatePlace
)
router.delete('/:pid', placesController.deletePlace)

module.exports = router
