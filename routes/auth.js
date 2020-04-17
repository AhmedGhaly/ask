const router = require('express').Router()
const  body = require('express-validator').body

const User = require('../models/user')
const isAuthen = require('../middleware/isAuth')
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
    , body('confirmpassword').trim().custom((value, {req}) => {
        return (value === req.body.password)
    })
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


router.post('/logout', isAuthen, userContoller.logOut)

router.post ('/forgetpass', userContoller.frogetPass)

router.post('/login/reset/:token'
    , body('password').not().isEmpty().isLength({min : 5})
    , body('confirmpassword').trim().custom((value, {req}) => {
        return (value === req.body.password)
    })
    , userContoller.resetPassword)


router.get('/confirm/:token', userContoller.confirmEmail)

module.exports = router