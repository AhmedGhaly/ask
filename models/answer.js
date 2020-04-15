const mongooes  = require('mongoose')


const answerSchema = mongooes.Schema({
    question : String,
    answer : String,
    userId : {
        type : mongooes.Schema.Types.ObjectId,
        ref : 'user'
    },
    from : {
        type : mongooes.Schema.Types.ObjectId,
        ref : 'user'
    },
    createdAt : Date,
    nestedAnswers : [{
        type : mongooes.Schema.Types.ObjectId,
        ref : 'answer'
    }]
})

module.exports = mongooes.model('answer', answerSchema)