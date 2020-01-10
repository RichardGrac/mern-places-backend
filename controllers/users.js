const HttpError = require('../models/http-error')
const { validationResult } = require('express-validator');
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const getUsers = async (req, res, next) => {

    let users
    try {
        users = await User.find({}, '-password')
    } catch (e) {
        return next(new HttpError('Users could not be found', 500))
    }

    if (!users || users.length === 0) {
        return next(new HttpError('No Users found', 404))
    }

    res
        .status(200)
        .json({
            message: 'Request successfully received',
            users: users.map(u => u.toObject({ getters: true }))
        })
}

const getUserById = async (req, res, next) => {
    const uid = req.params.uid

    let user
    try {
        user = await User.findById(uid)
    } catch (e) {
        return next(new HttpError('User could not be found', 500))
    }

    if (!user)
        return next(new HttpError('Could not be found given userId', 404))

    res.json({
        message: 'Successful request',
        user: user.toObject({ getters: true })
    })
}

const signUp = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty())
        return next(new HttpError('Invalid inputs passed, please check your data', 422))

    const {name, email, password} = req.body

    let user
    try {
        user = await User.findOne({email: email})
    } catch (e) {
        return next(new HttpError('Something went wrong while creating User, please try again later', 500))
    }

    if (user) return next(new HttpError('Account with same email address already exists', 400))

    let hashedPassword
    try {
        hashedPassword = await bcrypt.hash(password, 12)
    } catch (e) {
        return next(new HttpError('Could not create user, please try again. ' + e.message, 500))
    }

    try {
        user = new User({
            name,
            email,
            password: hashedPassword,
            imageUrl: req.file.path,
            places: []
        })
        await user.save()
    } catch (e) {
        return next(new HttpError('Something went wrong while creating User, please try again later', 500))
    }

    // Generate token
    let token
    try {
        token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_PRIVATE_KEY,
            {expiresIn: '1h'}
        )
    } catch (e) {
        return next(new HttpError('Signing up failed, please try again later. ' + e.message, 500))
    }

    res
        .status(201)
        .json({
            message: 'User created successfully',
            userId: user.id,
            token
        })
}

const signIn = async (req, res, next) => {
    const error = validationResult(req)
    if (!error.isEmpty()){
        return next(new HttpError('Invalid inputs passed, please check your data', 422))
}
    const {email, password} = req.body

    let user
    try {
        user = await User.findOne({email})
    } catch (e) {
        return next(new HttpError('Something went wrong while signing in, please try again later', 500))
    }

    if (!user)
        return next(new HttpError('Error while sign in, please verify credentials', 401))

    let isValidPassword = false
    try {
        // Compare the plain password with the hashed one that is stored
        isValidPassword = await bcrypt.compare(password, user.password)
    } catch (e) {
        return next(new HttpError('Could not log you in, please check your credentials and try again', 500))
    }

    if (!isValidPassword) return next(new HttpError('Invalid credentials, could not log you in', 401))

    // Generate token
    let token
    try {
        token = jwt.sign(
            {userId: user.id, email: user.email},
            process.env.JWT_PRIVATE_KEY,
            {expiresIn: '1h'}
        )
    } catch (e) {
        return next(new HttpError('Signing in failed, please try again later. ' + e.message, 500))
    }

    res.status(200).json({message: 'Successful log in', userId: user.id, token})
}

exports.getUsers = getUsers
exports.getUserById = getUserById
exports.signUp = signUp
exports.signIn = signIn
