const router = require('express').Router()
const  body = require('express-validator').body

const User = require('../models/user')
const isAuthen = require('../middleware/isAuth')
const authController = require('../controllers/authController')

// POST => /auth/signup
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
    , authController.signup)

// POST => /auth/login
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
    , authController.login)

// POST => /auth/logout
router.post('/logout', isAuthen, authController.logOut)

// POST => /auth/forgetpass
router.post ('/forgetpass', authController.frogetPass)

// POST => /auth/login/reset/:token
router.post('/login/reset/:token'
    , body('password').not().isEmpty().isLength({min : 5})
    , body('confirmpassword').trim().custom((value, {req}) => {
        return (value === req.body.password)
    })
    , authController.resetPassword)

// POST => /auth/confirm/:token
router.get('/confirm/:token', authController.confirmEmail)

// POST => /auth/me/changepassword
router.put('/me/changepassword', isAuthen
    , body('currentPass')
    , body('newPassword').not().isEmpty().isLength({min : 5})
    , body('confirmNewPassword').trim().custom((value, {req}) => {
        return (value === req.body.newPassword)
    })
    , authController.changePassword)




module.exports = router