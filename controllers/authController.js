const jwt = require('jsonwebtoken')
const validationResult = require('express-validator').validationResult
const bycrypt = require('bcryptjs')
const nodeMailer = require('nodemailer')
const sendGridTranport = require('nodemailer-sendgrid-transport')
const crypto = require('crypto')

const User = require('../models/user')


const trasport = nodeMailer.createTransport(sendGridTranport({
    auth : {
        api_key : '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'
    }
}))


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
        crypto.randomBytes(32, (err, buf) => {
            if(err){
                console.log(err)
                return res.status(500).json({
                    message : 'some error happned'
                })
            }
            const token = buf.toString('hex');
            trasport.sendMail({
                to : email,
                from : 'shop@AhmedGhaly.com',
                subject : 'confirm the email',
                html : `
                    <h1> confirm your email</h1>
                    <p> click this <a href = "http://localhost:3000/user/confirm/${token}?id=${newUser.email}" > link </a> to confirm your email </p>
                `
            })
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
        if(!user.active){
            const err = new Error("this email is not active yet")
            err.statusCode = 401
            throw err
        }
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

// the rest of this function must be in the frontend
exports.logOut = (req, res, next) => {
    let  token = req.get('Authorization')
    if(token) {
        res.status(200).json({
            message : 'you are logged out ',
            token : null
        })
    }
    else {
        res.status(404).json({
            message : 'you are not logged in yet'
        })
    }
}

// send a email for forget password

exports.frogetPass = async(req, res, next) => {
    const email = req.body.email
    User.find({email : email}).then(user => {
        if(!user){
            const err = new Error('invalid email')
            err.statusCode = 404
            throw err
        }

        sendTheMail(email)
        res.status(200).json({
            message : "done"
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

sendTheMail = (email) => {


    crypto.randomBytes(32, (err, buf) => {
        if(err){
            console.log(err)
            return res.status(500).json({
                message : 'some error happned'
            })
        }
        const expires = new Date();
        expires.setHours(expires.getHours() + 6);
        const token = buf.toString('hex');
        User.update({email : email}, {$set : {resetToken : token, expired : expires}}).then(user => {
            trasport.sendMail({
                to : email,
                from : 'shop@AhmedGhaly.com',
                subject : 'Reset Password',
                html : `
                    <h1> Reset Password</h1>
                    <p> click this <a href = "http://localhost:3000/user/login/reset/${token}" > link </a> to reset your password </p>
                `
            })
        })

    })
}


exports.resetPassword = (req, res, next) => {
    const token = req.params.token
    const password = req.body.password
    let theUser
    User.findOne({resetToken : token, expired : { $gt : new Date() }}).then(user => {
        if(!user){
            const err = new Error('invalid email')
            err.statusCode = 401
            throw err
        }
        theUser = user
        return bycrypt.hash(password, 12) 
    }).then(hashedpass => {
        theUser.password = hashedpass
            theUser.expired = new Date()
            theUser.resetToken = ''
            return theUser.save()
        }).then(user => {
            res.status(200).json({
                message : 'the updated done',
                user : user
            })
        }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.confirmEmail = (req, res, next) => {
    const token = req.params.token
    const email = req.query.id

    User.findOne({email : email}).then(user => {
        if(!user){
            const err = new Error('invalid email')
            err.statusCode = 401
            throw err
        }
        user.active = true
        return user.save()
    }).then(user => {
        res.status(200).json({
            message : 'activied done'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
    
}