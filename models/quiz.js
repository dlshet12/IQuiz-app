const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const questionSchema = new mongoose.Schema ({
  
    quizId: ObjectId,
    question: String,
    option: Array,
    answer: Number
    
});

var QuizesQuestion = mongoose.model('QuizQuestion', questionSchema);
module.exports= QuizesQuestion;