const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places')
const usersRoutes = require('./routes/users')

const app = express()

app.use(bodyParser.json())
app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((error, req, res, next) => {
    if (res.headerSent) {
        // If something else has returned a response
        return next(error)
    }

    res.status(error.code || 500)
    res.json({message: error.message || 'Unknown error ocurred'})
})

app.listen(5000)
