const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places')
const usersRoutes = require('./routes/users')
const HttpError = require('./models/http-error')

const app = express()

app.use(bodyParser.json())
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    throw new HttpError('Could not find route', 404)
})

app.use((error, req, res, next) => {
    if (res.headerSent) {
        // If something else has returned a response
        return next(error)
    }

    res.status(error.code || 500)
    res.json({message: error.message || 'Unknown error occurred'})
})

app.listen(5000)
