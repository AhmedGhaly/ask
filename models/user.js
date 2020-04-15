const mongooes  = require('mongoose')


const userSchema = mongooes.Schema({
    username : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    answers : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'answer'
    }],
    asks : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'ask'
    }],
    askToAsnswer : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'ask'
    }],
    answerMe : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'answer'
    }],
    follower : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'user'
    }],
    follows : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'user'
    }],
    intersting : [String]
})

module.exports = mongooes.model('user', userSchema)