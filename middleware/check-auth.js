const HttpError = require('../models/http-error')
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]

        if (!token) {
            throw new Error('Auth failed')
        }

        const decodedToken = jwt.verify(token, process.env.JWT_PRIVATE_KEY)
        req.userData = {
            userId: decodedToken.userId,
        }
        next()
    } catch (e) {
        throw new HttpError('Auth failed', 401)
    }
}
