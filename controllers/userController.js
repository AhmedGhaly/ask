const validationResult = require('express-validator').validationResult

const User = require('../models/user')




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

exports.blockUser = (req, res, next) => {
    const userId = req.userId
    const blockedUser = req.params.userId

    User.findById(blockedUser).then(user => {
        if(!user){
            const err = new Error('invalid user')
            err.statusCode = 401
            throw err
        }
        return User.findById(userId)
    }).then(user => {
        if(!user){
            const err = new Error('invalid user')
            err.statusCode = 401
            throw err
        }
        user.blockList.push(blockedUser)
        return user.save()
    }).then(user => {
        res.status(201).json({
            message : "done",
            user : user
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}