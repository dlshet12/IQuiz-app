require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const md5 = require("md5");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const isAuthenticated = require("./middleware/auth");
const userModel = require('./models/user');
const QuizesQuestion = require("./models/quiz");
const QuizTitle = require("./models/quizzes");
const QuizScore = require("./models/score");
const { query } = require('express');
const cors = require('cors');
const corsOptions = {
  origin: 'http://localhost:3000'
}

// env.config({path:"./config/config.env"});
// require("./env");

const app = express();

// console.log(process.env.API_KEY);

app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());
app.use(cors(corsOptions));

mongoose.connect("mongodb://localhost:27017/quizDB", { useNewUrlParser: true });

app.post("/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;
    const encryptPass = md5(password);
    req.body.password = encryptPass;
    if (!(email && password && firstName && lastName && role)) {
      return res.status(400).send("all the input is required");
    }
    const token = await jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    req.body.token = token;
    const user = await userModel.create(req.body);
    if (!user) {
      return res.status(400).send("Couldn't create the user");
    }
    return res.status(200).send(user);
  }
  catch (err) {
    return res.status(500).send("Something went wrong")
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body);
    if (!email && !password) {
      return res.status(400).send("email and password required");
    }
    const token = await jwt.sign({ email: email }, process.env.SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRE,
    });
    const foundUser = await userModel.findOne({ email: email })
    console.log(foundUser);
    if (!foundUser) {
      return res.status(400).send("couldnt login");
    }
    if (foundUser.password == md5(password)) {
      foundUser.toJSON();
      foundUser.password = undefined;
      const updatedUser = await userModel.updateOne({ email: email }, { token: token });
      foundUser.token = token;
      return res.status(200).send({ message: "successfully logged in", data: foundUser });
    }
    return res.status(401).send("invalid email or password");
  }
  catch (err) {
    return res.status(500).send("somthing went wrong")
  }
});

app.get("/admin", isAuthenticated, async (req, res) => {
});

app.post("/createtestQuestion", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role != "quizCreator") {
      return res.status(400).send("doesnt match as a creator");
    }
    const quizQuestions = await QuizesQuestion.create(req.body);
    console.log("%%%%%%%%%%%%%");
    if (!quizQuestions) {

      return res.status(400).send("cant create question");
    }
    return res.status(200).send(" Quiz creator found");
  }
  catch (err) {
    console.log(err);
    return res.status(500).send("somthing went wrong");
  }
})

app.post("/createQuizs", async (req, res) => {
  try {
    // if(req.user.role != "quizCreator"){
    //   return res.status(400).send("doesnt match as a creator");
    // }
    const quizname = await QuizTitle.create(req.body);
    if (!quizname) {
      return res.status(400).send("please enter the quiz name");
    }
    return res.status(200).send(" Quiz creator found");
  }
  catch (err) {
    console.log(err);
    return res.status(500).send("somthing went wrong");
  }
})

app.post("/addQuestions", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role != "quizCreator") {
      return res.status(400).send("doesnt match as a creator");
    }
    const rest = await QuizTitle.findOne({ quizId: req.body.quizId })
    if (!rest) {
      return res.status(400).send("quiz name doesnt exists");
    }
    const foundQuiz = await QuizesQuestion.create(req.body);
    if (!foundQuiz) {
      return res.status(400).send("please enter the quiz name");
    }
    return res.status(200).send(" Quiz creator found");
  }
  catch (err) {
    return res.status(500).send("somthing went wrong");
  }
});

app.get("/quizList", async (req, res) => {
  try {
    // console.log("Called!!!!")
    // if (req.user.role != "participant") {
    //   return res.status(400).send("sorry coudnt find the user");
    // }
    const listOfTest = await QuizTitle.find({})
    if (!listOfTest) {
      return res.status(400).send("coudnt find quiz list");
    }
    return res.status(200).send({ message: " Quiz found", data: listOfTest });
  }
  catch (err) {
    console.log("Error: ", err)
    return res.status(500).send("somthing went wrong");
  }
});

app.get("/quizQuestion/:quizId", isAuthenticated, async (req, res) => {
  console.log("CALLED: &&&&&&")
  try {
    if (req.user.role != "participant") {
      return res.status(400).send("sorry coudnt find the user");
    }
    if (!req.params.quizId) {
      return res.status(400).send("Please provide quizId");
    }
    const listOfQuestion = await QuizesQuestion.find({ quizId: req.params.quizId });
    listOfQuestion.forEach(object => {
      object.answer = undefined;
    });
    console.log("Questions: ", listOfQuestion);
    // mongoose.Query.select('-answer');
    if (!listOfQuestion) {
      score.create({ quizId: req.params.quizId, score: score })
    }
    return res.status(200).send({ message: " Quiz found", data: listOfQuestion });
  }
  catch (err) {
    return res.status(500).send("somthing went wrong");
  }
});

app.post("/submitQuiz", isAuthenticated, async (req, res) => {
  try {
    if (req.user.role != "participant") {
      return res.status(400).send("sorry coudnt find the user");
    }
    const { quizId, answers } = req.body;
    if (!(quizId && answers)) {
      return res.status(400).send("provide the required field");
    }
    let score = 0;
    for (object of answers) {
      const Question = await QuizesQuestion.findOne({ answers });
      if (!Question) {
        return res.status(400).send("coudnt find questions");
      }
      if (Question.answer == object.answer) {
        score += 1;
      }
    }
    const testScore = await QuizScore.create({ quizId: req.body.quizId, participationId: req.user._id, score: score })
    if (!testScore) {
      return res.status(400).send("no score");
    }
    return res.status(200).send({ message: " total score", data: testScore });
  }
  catch (err) {
    return res.status(500).send("somthing went wrong");
  }
})

app.get("/getScore/:quizId", isAuthenticated, async(req, res)=> {
  try{
    if (req.user.role != "participant") {
      return res.status(400).send("sorry coudnt find the user");
    }
    if (!req.user._id && !req.params.quizId) {
      return res.status(400).send("no quiz result found");
    }
    const quizScore = await QuizScore.findOne({participationId:req.user._id, quizId : req.params.quizId})
    console.log(quizScore);
    if (!quizScore) {
      return res.status(400).send("sorry could find score");
    }
    return res.status(200).send({message: " secured score", data:quizScore})
  }
    catch(err){
      console.log(err);
     return res.status(500).send("somthing went wrong");
  }
})

app.listen(4000, function () {
  console.log("server started in port 4000");
});