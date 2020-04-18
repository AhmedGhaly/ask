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
    let thetoken
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.statusCode = 401
        console.log(err)
        err.data = err.array()
        throw error
    }

    crypto.randomBytes(32, (err, buf) => {
        if(err){
            const error = new Error('something went wrong')
            throw error
        }
        const token = buf.toString('hex');
        thetoken = token
        trasport.sendMail({
            to : email,
            from : 'shop@AhmedGhaly.com',
            subject : 'confirm the email',
            html : `
                <h1> confirm your email</h1>
                <p> click this <a href = "http://localhost:3000/user/confirm/${token}" > link </a> to confirm your email </p>  `
        })
    })
    bycrypt.hash(password, 12).then(hashedpass => {
        let newUser = new User({
            username : username,
            password : hashedpass,
            email : email,
            activeToken : thetoken,
            activeTokenExpired : new Date().setHours(new Date().getHours() + 2)
        })
        return newUser.save()    


    // bycrypt.hash(password, 12).then(hashpass => {
        
    //     return crypto.randomBytes(32) 
    // }).then( (buf) => {
    //    return token = buf.toString('hex');
    // }).then(token => {
    //     trasport.sendMail({
    //         to : email,
    //         from : 'shop@AhmedGhaly.com',
    //         subject : 'confirm the email',
    //         html : `
    //             <h1> confirm your email</h1>
    //             <p> click this <a href = "http://localhost:3000/user/confirm/${token}" > link </a> to confirm your email </p>  `
    //     })
    //     return token
    // }).then(token => {
    //     let newUser = new User({
    //         username : username,
    //         password : hashpass,
    //         email : email,
    //         activeToken : token,
    //         activeTokenExpired : new Date().setHours(new Date().getHours() + 2)
    //     })
    //     return newUser.save()     
    })
    .then(user => {
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

exports.getMyInfo = (req, res ,next) => {
    const userId = req.userId
    console.log(userId) 
    User.findById(userId).populate('answers', 'question answer').then(user => {
        if(!user){
            const err = new Error('there is no user with that id!')
            err.statusCode = 404
            throw err
        }
        const userSend = {
            name : user.username,
            email : user.email,
            answer : user.answers
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
            answer : user.answers
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

    User.findOne({activeToken : token, activeTokenExpired : { $gt : new Date() }}).then(user => {
        if(!user){
            const err = new Error('invalid token')
            err.statusCode = 404
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

exports.changePassword = (req, res, next) => {
    const { newPassword, currentPass } = req.body
    let theUser
    const error = validationResult(req)
    if(!error.isEmpty()){
        const err = new Error('invlaid input')
        err.data = error.array()
        throw err

    }
    User.findById(req.userId).then (user => {
        if(!user){
            const err = new Error('the user is not founded')
            err.statusCode = 404
            throw err
        }
        theUser = user
        return bycrypt.compare(currentPass, user.password)
    }).then(isMatched => {
        if(!isMatched){
            const err = new Error('wrong password')
            err.statusCode = 401
            throw err
        }
        return bycrypt.hash(newPassword, 12)
        
    }).then(hashedpass => {
        theUser.password = hashedpass
        return theUser.save()
    }).then(user => {
        res.status(200).json({
            message : "done"
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.editeUser = (req, res, next) => {
    const userId = req.userId
    const { username, email} = req.body
    const error = validationResult(req)
    let theUser
    if(!error.isEmpty()){
        const err = new Error('invlaid input')
        err.data = error.array()
        throw err

    }
    User.findById(userId).then(user => {
        if(!user){
            const err = new Error('the user is not founded')
            err.statusCode = 404
            throw err
        }
        theUser = user
        if(email !== user.email){
            return User.findOne({email : email})
        }
    }).then(user => {
        if(user){
            const err = new Error('the email exist')
            err.statusCode = 403
            throw err
        }
        else if(email !== theUser.email) {
            theUser.email = email
            theUser.active = false
        }
        if(username) {
            theUser.username =  username
        }

        return theUser.save()
    }).then(user => {
        res.status(200).json({
            message : 'your data is updated',
            user : {
                username : user.username,
                email : user.email
            }
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })

}

exports.deleteUser = (req, res, next) => {
    const userId = req.userId
    User.findByIdAndDelete(userId).then(user => {
        if(!user){
            const err = new Error('the user is not founded')
            err.statusCode = 404
            throw err
        }
        res.status(200).json({
            message : "done"
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}