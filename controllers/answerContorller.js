const validationResult = require('express-validator').validationResult

const Answer = require('../models/answer')
const User = require('../models/user')
const Ask = require('../models/ask')

//////////////////////// my fuctoins /////////////////////////////////////////

function compare(a, b) {
    if (new Date(a.createdAt) < new Date(b.createdAt)) return 1
    return -1
}
/////////////////////////////////////////////////////////////////////


    
///////////////////get methods//////////////////////////////////////
exports.getHome = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).then(user => {
        return user.follower
    }).then(followers => {
        return Answer.find({'userId' : {$in: followers}}).populate('userId', 'username')
    }).then(answer => {
        answer.sort(compare)
        res.status(200).json({
            message : 'fetch done',
            answers : answer
        })
    })
}
    
    
exports.getAnswer = (req, res, next) => {
    const userId = req.userId
    let thatAnswer, answers
    User.findById(userId)
    .populate({
        path: 'answers',
        select : 'question answer from',
        populate: { path: 'from', select : 'username' }
      })
    .then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        thatAnswer = user.answers
        res.status(200).json({
            message : "fetch all answer of the user is done",
            answer :  thatAnswer
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getanswerMe = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).populate({
        path : 'answerMe',
        select : 'question answer userId',
        populate : {path : 'userId', select : 'username'}
    }).then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        const answerme = user.answerMe
        res.status(200).json({
            message : "fetch all answer of your asks is done",
            answer : answerme
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getAskToAnswer = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).populate({
        path : 'askToAsnswer',
        select : 'question from',
        populate : { path : 'from', select : 'username'}
    }).then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        const askToAnswer = user.askToAsnswer
        res.status(200).json({
            message : "fetch all asks wait for answer it  is done",
            answer : askToAnswer
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getAsks = (req, res, next) => {
    const userId = req.userId
    User.findById(userId)
    .populate({
        path : 'asks',
        select : 'question to answer',
        populate : { path : 'to', select : 'username'},
        populate : { path : 'answer', select : 'question answer'}
    })
    .then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        const asks = user.asks
        res.status(200).json({
            message : "fetch all asks wait for answer it  is done",
            ask : asks
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getFollower = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).populate('follower', 'username email').then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        const follower = user.follower
        res.status(200).json({
            message : "fetch all asks that for answer it  is done",
            follower : follower
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getFollows = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).populate('follows', 'username email').then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        const follows = user.follows
        res.status(200).json({
            message : "fetch all asks that for answer it  is done",
            followes : follows
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}
exports.getOneAnswer = (req, res, next) => {
    const answerId = req.params.answerId
    Answer.findById(answerId)
    .populate({
        path : 'nestedAnswers', 
        select : 'question answer from',
        populate : { path : 'from', select : 'username'}
    })
    .populate ({
        path : 'userId from',
        select : 'username'
    })
    .then(ans => {
        if(!ans){
            const err = new Error("invalid id answer")
            err.statusCode = 404
            throw err
        }
        res.status(200).json({
            message : "fetch the data done",
            ans : ans
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.getIntersting = (req, res, next) => {
    const userId = req.userId
    User.findById(userId).then(user => {
        res.status(200).json({
            message : 'get done',
            intersting : user.intersting
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
} 

//////////////////////////////////////////////////////////////////////////

exports.postIntersting = (req, res, next) => {
    const userId = req.userId
    const intersting = req.body.intersting
    let founded
    User.findById(userId).then(user => {
        user.intersting.find(interst => {
            if (interst === intersting)
                founded = true
        })
        if(founded){
            const err = new Error('this intersting is aleady exist')
            err.statusCode = 403
            throw err
        }
        user.intersting.push(intersting)
        return user.save()
    }).then(user => {
        res.status(200).json({
            message : 'added done'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.deleteInterste = (req, res, next) =>{
    let founded
    const intersting = req.params.interst
    const userId = req.userId
    User.findById(userId).then(user => {
        user.intersting.find(interst => {
            if (interst === intersting)
                founded = true
        })
        if(!founded){
            const err = new Error('this intersting is not exist')
            err.statusCode = 403
            throw err
        }
        user.intersting.pull(intersting)
        return user.save()
    }).then(user => {
        res.status(200).json({
            message : 'the item deleted'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.deleteAnswer = (req, res, next) => {
    const answerId = req.params.answerId

    Answer.findById(answerId).then(ans => {
        if(!ans){
            const err = new Error("invalid id answer")
            err.statusCode = 404
            throw err
        }

        return User.findById(ans.userId)
    }).then(user => {
        if(user._id.toString() !== req.userId){
            const err = new Error("you have not permission for this action")
            err.statusCode = 403
            throw err
        }
        Answer.deleteOne({_id : answerId}).then(ans => {
            user.answers.pull(answerId)
            return user.save()
        })
    }).then(() => {
        res.status(200).json({
            message : 'the answer deleted!'
        })
    })
    .catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}


exports.editeAnswer = (req, res, next) => {
    const answerId = req.params.answerId
    const question = req.body.question
    const answer = req.body.answer
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.statusCode = 401
        throw error
    }
    Answer.findById(answerId).then(ans => {
        if(!ans){
            const err = new Error("invalid id answer")
            err.statusCode = 404
            throw err
        }
        if(req.userId != ans.userId.toString()){
            const err = new Error("you have not permission for this action")
            err.statusCode = 403
            throw err
        }
        ans.question = question
        ans.answer = answer
        return ans.save()
    }).then(ans => {
        res.status(200).json({
            message : 'the answer edite!',
            answer : ans
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })

}

exports.getAsk =  (req, res, next) => {
    const question = req.body.question;
    const to = req.params.userId;
    const from = req.userId
    const hidden = req.body.hidden
    const answerId = req.query.ans
    let newAsk 
    let theAnswer = ''
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.statusCode = 401
        throw error
    }

    Answer.findById(answerId).then(answer => {
        if(answerId){
            if(!answer){
                const error = new Error('invalid id answer')
                error.statusCode = 404
                throw error
            }
            if(to !== answer.userId.toString()){
                const error = new Error('the user has not have this answer')
                error.statusCode = 500
                throw error
            }
            theAnswer = answer
        }
        return User.findById(to)
    }).then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        newAsk = new Ask({
            to : to,
            from : from,
            question : question,
            hidden : hidden,
            answer : theAnswer._id
        })
        user.askToAsnswer.push(newAsk)
        return user.save()
    }).then(result => {
        return User.findById(from)
    }).then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        user.asks.push(newAsk)
        return user.save()
    }).then(user => {
        return newAsk.save()
        
    }).then(ans => {
        res.status(200).json({
            message : 'the question send',
            ask : ans
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
    
}

exports.answer = (req, res, next) => {
    const askId = req.params.askId
    let thatAsk,  newAnswer
    const err = validationResult(req)
    if(!err.isEmpty()){
        const error = new Error('there something werong in the data you input')
        error.statusCode = 401
        throw error
    }
    Ask.findById(askId).then(ask => {
        thatAsk = ask
        if(!ask){
            const err = new Error("invalid id ask")
            err.statusCode = 404
            throw err
        }
        if(ask.to.toString() !== req.userId){
            const err = new Error("that question is not to you sorry!")
            err.statusCode = 500
            throw err
        }
        const answer = req.body.answer
        newAnswer = new Answer({
           question : ask.question,
           answer : answer,
           userId : ask.to,
           from : ask.from,
           createdAt : new Date()
        })
        return newAnswer.save()

    }).then(ans => {
        return User.findById(thatAsk.to)
    }).then(user => {
        if(thatAsk.answer){
            Answer.findById(thatAsk.answer).then(ans => {
                ans.nestedAnswers.push(newAnswer._id)
                return ans.save()
            })
        }else
            user.answers.push(newAnswer._id)
        user.askToAsnswer.pull(askId)
        return user.save()
    }).then (user => {
        return User.findById(thatAsk.from)
        
    }).then(user => {
        user.answerMe.push(newAnswer._id)
        user.asks.pull(askId)
        return user.save()
    }).then(user => {
        return Ask.findByIdAndDelete(askId)
        
    }).then(ask => {
        res.status(200).json({
            message : 'the work done'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })

}

exports.follow = (req, res, next) => {
    const userId = req.userId
    const follow = req.params.userId
    let followId
    User.findById(follow).then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        let ifFollow
         user.follows.find(user => {
            if(user.toString() === userId)
                ifFollow = true
        })
        if(ifFollow){
            const err = new Error("you have aleady follow him!!")
            err.statusCode = 500
            throw err
        }
        user.follows.push(userId)
        return user.save()
    }).then(user => {
        followId = user._id
        return User.findById(userId)
    }).then(user => {
        user.follower.push(followId)
        return user.save()
    }).then(user => {
        res.status(201).json({
            message : 'follow has done !!'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })

}

exports.unfollow = (req, res, next) => {
    const userId = req.userId
    const followedUser = req.params.userId
    let notFollowed
    User.findById(followedUser).then(user => {
        if(!user){
            const err = new Error("invalid id user")
            err.statusCode = 404
            throw err
        }
        user.follower.find(user => {
            if(user !== userId){
                notFollowed = true
            }
        })
        if(notFollowed){
            const err = new Error('you aleady not followed him')
            err.statusCode = 404
            throw err
        }
        user.follows.pull(userId)
        return user.save()
    }).then(user => {
        return User.findById(userId)
    }).then(user =>{
        user.follower.pull(followedUser)
        return user.save()
    }).then(user => {
        res.status(200).json({
            message : 'you unfollow him'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}

exports.deleteAsk = (req, res, next) =>{
    const askId = req.params.askId
    const userId = req.userId
    let theAsk
    Ask.findById(askId).then(ask => {
        console.log(ask)
        if(!askId){
            const err = new Error('invaild id ask')
            err.statusCode = 403
            throw err
        }
        if(ask.to.toString() !== userId){
            const err = new Error('you have no permission to do that ')
            err.statusCode = 500
            throw err
        }
        theAsk = ask.from
        return Ask.deleteOne({_id : askId})
    }).then(ask => {
        return User.findById(userId)
    }).then(user => {
        user.askToAsnswer.pull(askId)
        return user.save();
    }).then(user => {
        return User.findById(theAsk)
    }).then(user => {
        user.asks.pull(askId)
        return user.save() 
    }).then(user => {
        res.status(200).json({
            message : 'the item deleted'
        })
    }).catch(err => {
        if(!err.statusCode)
            err.statusCode = 500
        next(err)
    })
}
