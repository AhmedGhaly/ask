const router = require('express').Router()
const  body = require('express-validator').body
const User = require('../models/user')

const userContoller = require('../controllers/authController')

router.post('/signup'
    , body('email').trim().not().isEmpty().isEmail()
        .custom((value, {req}) => {
            return User.findOne({email : value}).then(user =>{
                if(user)
                    return Promise.reject('this email is already exists')
            })
        })
    , body('username').trim().not().isEmpty().isLength({min : 5})
    , body('password').not().isEmpty().isLength({min : 5})
    , userContoller.signup)

router.post('/login'
    , body('email').trim().not().isEmpty().isEmail()
    .custom((value, {req}) => {
        return User.findOne({email : value}).then(user =>{
            if(!user)
                return Promise.reject('this email is already exists')
        })
    })
    .normalizeEmail()
    , body('password').not().isEmpty().isLength({min : 5}).trim()
    , userContoller.login)

router.get('/:userId', userContoller.getUseInfo)


module.exports = router