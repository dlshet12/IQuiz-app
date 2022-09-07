const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const scoreschema = new mongoose.Schema ({
    
    quizId: ObjectId,
    participationId : ObjectId,
    score : Number
    
});

var QuizScore = mongoose.model('QuizScore', scoreschema);
module.exports= QuizScore;