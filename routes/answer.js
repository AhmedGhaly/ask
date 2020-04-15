const router = require('express').Router()
const body = require('express-validator').body

const isAuthen = require('../midleware/isAuth')
const answerController = require('../controllers/answerContorller')


//////////////// get methods//////////////////////////////////////

// home page 
router.get('/', isAuthen, answerController.getHome)

// fetch the answer that i answer it by my self
router.get('/myanswer', isAuthen, answerController.getAnswer)

// fetch answers of my question
router.get('/answerme', isAuthen, answerController.getanswerMe)

//the asks to you
router.get('/asktoanswer', isAuthen, answerController.getAskToAnswer)

//get my asks to the people
router.get('/myasks', isAuthen, answerController.getAsks)

//get my people that i follow
router.get('/follower', isAuthen, answerController.getFollower)

//get my follows
router.get('/follows', isAuthen, answerController.getFollows)

router.get('answer/:answerId', isAuthen, answerController.getOneAnswer)

router.get('/interst', isAuthen, answerController.getIntersting)


///////////////////////////////////////////////////////////////////

router.delete('/interst/:interst', isAuthen, answerController.deleteInterste)

router.delete ('/answer/:answerId', isAuthen, answerController.deleteAnswer)

router.delete('/ask/:askId', isAuthen, answerController.deleteAsk)

router.put('/:answerId'
    , body('question').not().isEmpty()
    , body('answer').not().isEmpty()
    , isAuthen, answerController.editeAnswer)

router.post('/ask/:userId'
    , body('question').not().isEmpty()
    , isAuthen, answerController.getAsk)


router.post('/answer/:askId'
    , body('answer').not().isEmpty()
    , isAuthen, answerController.answer)

router.post('/follow/:userId', isAuthen, answerController.follow)

router.delete('/follow/:userId', isAuthen, answerController.unfollow)

router.post('/interst', isAuthen, answerController.postIntersting)

module.exports = router