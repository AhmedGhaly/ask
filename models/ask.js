const mongooes  = require('mongoose')


const askSchema = mongooes.Schema({
    to : {
        type : mongooes.Schema.Types.ObjectId,
        ref : 'user'
    },
    from : {
        type : mongooes.Schema.Types.ObjectId,
        ref : 'user'
    } ,
    question : String,
    hidden : {
        type : Boolean,
        default : false
    },
    answer : {
        type : mongooes.Schema.Types.ObjectId,
        ref : 'answer'
    }
})

module.exports = mongooes.model('ask', askSchema)