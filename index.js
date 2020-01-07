const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places')
const usersRoutes = require('./routes/users')
const HttpError = require('./models/http-error')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())
app.use(express.json())
app.use(cors())

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept")
    next()
})
app.set('port', process.env.PORT || 5000)

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
mongoose
    .connect(`mongodb://localhost:27017/mern_course_backend?replicaSet=rs`)
    .then(() => {
        console.log('App Connected to Database')
    })
    .catch(err => {
        console.log(err)
    })

app.listen(app.get('port'), () => {
    console.log('Running backend at port ' + app.get('port'))
})
