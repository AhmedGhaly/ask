const jwt = require('jsonwebtoken')
const validationResult = require('express-validator').validationResult
const bycrypt = require('bcryptjs')

const User = require('../models/user')



exports.signup = (req, res, next) => {
    const username = req.body.username
    const email = req.body.email
    const password = req.body.password
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.statusCode = 401
        throw error
    }
    bycrypt.hash(password, 12).then(hashpass => {
        let newUser = new User({
            username : username,
            password : hashpass,
            email : email
        })
        return newUser.save()
    }).then(user => {
        res.status(201).json({
            message : 'the user signup',
            user : user
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.login = (req, res, next) => {
    let userLogged
    const email = req.body.email
    const password = req.body.password
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.statusCode = 401
        throw error
    }
    User.findOne({email : email}).then(user => {
        userLogged = user
        return bycrypt.compare(password, user.password)
        
    }).then(isMatched => {
            if(!isMatched){
                const err = new Error('wrong password')
                err.statusCode = 401
                throw err
            }

            const token = jwt.sign({
                email : userLogged.email,
                id : userLogged._id
            }, 'the secrit key for the token migth be long and long het how are uou')

            res.status(200).json({
                messsage : 'the user is logged in ',
                token : token,
                userId : userLogged._id
            })
        }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getUseInfo = (req, res, next) => {
    const userId = req.params.userId
    User.findById(userId).populate('answers', 'question answer').then(user => {
        if(!user){
            const err = new Error('there is no user with that id!')
            err.statusCode = 404
            throw err
        }
        const userSend = {
            name : user.username,
            email : user.email,
            answer : user.answers,
        }
        res.status(200).json({
            message : 'get user info done',
            user : userSend
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}