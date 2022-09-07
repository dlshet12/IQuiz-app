const userModel = require("../models/user")
const jwt = require("jsonwebtoken");
require('dotenv').config();

const isAuthenticated = async(req,res,next) => {
console.log("ttttyyyyyyyyyyyy");
   try{
       const token = req.headers['authorization'].substring("bearer ".length);
        console.log("thisthetorkm",token);
        
         if(!token) {
           
            return res.status(401).json({msg: "no token, authorization denied"});
          
        }
        const verify =  jwt.verify(token, process.env.SECRET_KEY);
        console.log("its verifying",verify);
      
        const user = await userModel.findOne({email: verify.email}).exec();
            console.log("email exist in db",user)
            if(!user){

              return res.status(400).send({message:"user doesnt not exits"});
            }
          req.user = user;
         next(); 
    } 
    catch (err) {
       
           return res.status(500).send({msg : "somthing went wrong"});
    }
} 
module.exports = isAuthenticated;
