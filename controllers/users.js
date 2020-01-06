const uuid = require('uuid')
const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator');

let DUMMY_USERS = [
    {
        id: 'u1',
        name: 'Richard',
        email: 'richard@test.com',
        password: 'testtest',
    },
    {
        id: 'u2',
        name: 'Maximilian',
        email: 'max@test.com',
        password: 'testtest',
    },
]

const getUsers = (req, res, next) => {
    res
        .status(200)
        .json({
            message: 'Request successfully received',
            users: DUMMY_USERS
        })
}

const getUserById = (req, res, next) => {
    const uid = req.params.uid

    const user = DUMMY_USERS.filter(u => u.id === uid)

    if (!user)
        throw new HttpError('Could not be found given userId')

    res.json({
        message: 'Successful request',
        user
    })
}

const signUp = (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty())
        throw new HttpError('Invalid inputs passed, please check your data', 422)

    const {name, email, password} = req.body

    const alreadyExists = DUMMY_USERS.find(u => u.email === email)

    if (alreadyExists)
        throw new HttpError('Account with same email address already exists')

    const newUser = {
        id: uuid(),
        name,
        email,
        password
    }

    DUMMY_USERS.push(newUser)

    res
        .status(201)
        .json({
            message: 'User created successfully',
            user: newUser
        })
}

const signIn = (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty())
        throw new HttpError('Invalid inputs passed, please check your data', 422)

    const {email, password} = req.body

    const user = DUMMY_USERS.find(u => u.email === email && u.password === password)
    if (!user)
        throw new HttpError('Error while sign in, please verify credentials', 404)

    res.status(200).json({message: 'Successful log in', userId: user.id})
}

exports.getUsers = getUsers
exports.getUserById = getUserById
exports.signUp = signUp
exports.signIn = signIn
