const express = require('express')
const router = express.Router()

const DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Richard',
        password: '*****',
    },
    {
        id: 'u2',
        name: 'Maximilian',
        password: '*****',
    },
]

router.get('/:uid', (req, res, next) => {
    const uid = req.params.uid
    res.json({
        message: 'Successful request to USERS',
        users: DUMMY_USERS.filter(u => u.id === uid)
    })
})

module.exports = router
