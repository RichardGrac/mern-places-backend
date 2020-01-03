const express = require('express')
const router = express.Router()

const DUMMY_PLACES = [
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

router.get('/:pid', (req, res, next) => {
    const pid = req.params.pid
    const places = DUMMY_PLACES.filter(p => p.id === pid)

    if (places.length < 1) {
        const error = new Error('Cannot find Place with given id')
        error.code = 404
        return next(error)
    }

    res.json({
        message: 'Successful request to PLACES',
        places
    })
})

router.get('/user/:uid', (req, res, next) => {
    const uid = req.params.uid
    const places = DUMMY_PLACES.filter(p => p.creator === uid)

    if (places.length < 1) {
        const error = new Error('Cannot find Places for the given userId')
        error.code = 404
        throw error
    }

    res.json({
        message: 'Successful request to PLACES :uid',
        places
    })
})

module.exports = router
