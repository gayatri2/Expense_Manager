require('dotenv').config();//environment variable
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');


const mongoose=require('mongoose');
const encrypt = require("mongoose-encryption");
mongoose.connect('mongodb+srv://g3:g3@cluster0.9owf4.mongodb.net/userDB',{ useNewUrlParser: true, useUnifiedTopology: true } ); 

const userSchema=new mongoose.Schema({  
  email:String,
  password:String
});
const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
const User=new mongoose.model("User",userSchema);

app.use(express.static("public"));
app.get("/", function (req,res){
  res.sendFile(__dirname+"/index.html")});

app.get("/register", function (req,res)
{
    res.sendFile(__dirname+"/register.html")
});
app.get("/home", function (req,res){
  res.sendFile(__dirname+"/home.html")});
app.get("/dashboard", function (req,res){
    res.sendFile(__dirname+"/dashboard.html")});
app.get("/settings", function (req,res){
      res.sendFile(__dirname+"/settings.html")});


 
app.post("/register",function(req,res){
  const newUser =  new User({
    email: req.body.email,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      res.sendFile(__dirname+"/home.html")      

    }
  });

});
app.post("/login",function(req,res){
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email: email}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.sendFile(__dirname+"/home.html")
        }
      }
    }
  });

});

app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
