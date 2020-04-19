const router = require('express').Router()
const  body = require('express-validator').body

const User = require('../models/user')
const isAuthen = require('../middleware/isAuth')
const userController = require('../controllers/userController')



// GET => /user/:userId
router.get('/:userId', userController.getUseInfo)

// GET => /user/me/useinfo
router.get('/me/userinfo', isAuthen, userController.getMyInfo)

// PUT => /user/me/edit
router.put('/me/edit'
    , body('email').trim().not().isEmpty().isEmail()
    , isAuthen, userController.editeUser)

// DELETE => /user/delete
router.delete('/delete', isAuthen, userController.deleteUser)

router.post('/block/:userId', isAuthen, userController.blockUser)


module.exports = router