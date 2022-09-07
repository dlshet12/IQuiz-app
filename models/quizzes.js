const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const quizschema = new mongoose.Schema ({
    
    title: String
    
});

var QuizTitle = mongoose.model('QuizTitle', quizschema);
module.exports= QuizTitle;