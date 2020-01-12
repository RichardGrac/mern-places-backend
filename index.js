const fs = require('fs')
const path = require('path')

const express = require('express')
const bodyParser = require('body-parser')

const placesRoutes = require('./routes/places')
const usersRoutes = require('./routes/users')
const HttpError = require('./models/http-error')
const mongoose = require('mongoose')

const app = express()

app.use(bodyParser.json())

app.use('/uploads/images', express.static(path.join('uploads', 'images')))

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', "*")
    res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept, Authorization, Referer, Sec-Fetch-Mode, Sec-Fetch-Site, User-Agent, Connection, Accept-Encoding, Accept-Language")
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS')
    next()
})

app.set('port', process.env.PORT || 5000)

app.use('/api/places', placesRoutes)
app.use('/api/users', usersRoutes)

app.use((req, res, next) => {
    const error = new HttpError('Could not find this route.', 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file) {
        // console.log('req.file: ', req.file)
        fs.unlink(req.file.path, err => {
            console.log('Unlink error: ' + err)
        })
    }

    if (res.headerSent) {
        // If something else has returned a response
        return next(error)
    }

    res.status(error.code || 500)
    res.json({message: error.message || 'Unknown error occurred'})
})

mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-npgui.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`)
    .then(() => {
        console.log('App Connected to Database')
    })
    .catch(err => {
        console.log(err)
    })

app.listen(app.get('port'), () => {
    console.log('Running backend at port ' + app.get('port'))
})
