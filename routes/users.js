const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users.js')
const { check } = require('express-validator');
const fileUpload = require('../middleware/file-upload')

router.get('/', usersController.getUsers)
router.get('/:uid', usersController.getUserById)
router.post(
    '/signup',
    fileUpload.single('image'),
    [
        check('email').normalizeEmail().isEmail(),
        check('name').not().isEmpty(),
        check('password').isLength({min: 6})
    ],
    usersController.signUp
)
router.post(
    '/signin',
    [
        check('email').normalizeEmail().isEmail(),
        check('password').isLength({min: 6})
    ],
    usersController.signIn
)

module.exports = router
