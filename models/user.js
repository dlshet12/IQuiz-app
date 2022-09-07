
const Mongoose = require("mongoose");


const usersSchema = new Mongoose.Schema ({
    firstName:{
        type: String,
        default: null
    },

    lastName:{
        type: String,
        default:null
      },

    role: {
        type: String
    },

    email:{
         type: String, 
        unique: true
    },
    password: {
        type: String,
        minlength:[8, 'password should be minimum of 8 characters long'],
        required: true,
      },
      token : {
        type : String
      }
});


const userModel = Mongoose.model("user", usersSchema);
module.exports = userModel;