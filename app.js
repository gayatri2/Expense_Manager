require('dotenv').config();//environment variable
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const _ = require("lodash");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs');


const mongoose=require('mongoose');
const encrypt = require("mongoose-encryption");
global.email="";
global.b1=0;
global.flag=0;
mongoose.connect('mongodb+srv://g3:g3@cluster0.9owf4.mongodb.net/userDB',{ useNewUrlParser: true, useUnifiedTopology: true } ); 

const userSchema=new mongoose.Schema({  
  email:String,
  password:String,
  budget:Number
});


const expenseSchema=new mongoose.Schema({  
  email:String,
  category:String,
  cost:Number,
  item: String,
  date:
  {
    type:Date, 
    default:Date.now()
  },
  delete:Boolean
  
});

const secret = "Thisisourlittlesecret.";
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
const User=new mongoose.model("User",userSchema);
const Expense = new mongoose.model("Expense",expenseSchema);

app.use(express.static("public"));
app.get("/", function (req,res){
  res.sendFile(__dirname+"/index.html")});

app.get("/register", function (req,res)
{
    res.sendFile(__dirname+"/register.html")
});
app.get("/home", function (req,res){
  if(flag===1)
  {
    res.sendFile(__dirname+"/home.html");
  }
  else{
    res.sendFile(__dirname+"/index.html");
  }
});
  
/*app.get("/dashboard", function (req,res){
    if(flag===1)
    {
      Expense.find({ emai : email }, function(err, results) {
        if (err) {
          console.log(err);
        } else {
          res.render("dashboard",{budget:b1,results:results});
          console.log(results);
        }
      });
      res.render("dashboard",{budget:b1});
    }
    else
    {
      res.sendFile(__dirname+"/index.html");
    }
});*/
app.get("/dashboard", function(req, res){
  if(flag==1)
  {   
    Expense.find({ email: email }, function(err, results) {
        if (err) {
          console.log(err);
        } else {
          console.log(results);
          res.render('dashboard',{budget:b1,results:results});
        }
      });
  }
  else{res.redirect('/')}
});
app.get("/settings", function (req,res){
    if(flag===1)
    {
      res.sendFile(__dirname+"/settings.html");
    }
    else
    {
      res.sendFile(__dirname+"/index.html");  
    }
   
});
app.get("/logout",function(req,res){
  if(flag===1)
  {
    flag=0;
    res.redirect("/");
  }
  else
  {
    res.redirect("/");
  }
  
});

 
app.post("/register",function(req,res){
  email=req.body.email;
  const newUser =  new User({
    email: req.body.email,
    password: req.body.password
  });
  newUser.save(function(err){
    if (err) {
      console.log(err);
    } else {
      flag=1;
      b1=0;
      res.sendFile(__dirname+"/home.html")      

    }
  });

});
app.post("/login",function(req,res){
  email=req.body.email;
  const password = req.body.password;
  User.findOne({email: email}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {

      if (foundUser) {
        if (foundUser.password === password) {
          b1=foundUser.budget;
          flag=1;
          res.sendFile(__dirname+"/home.html")
        }
      }
    }
  });

});
app.post("/budget",function(req,res){
  const budget=Number(req.body.budget);
  b1=req.body.budget;

  console.log(budget);
  User.updateOne({email:email},{budget:budget},function(err){
   if(err){
     console.log(err);
   }
   else{
     console.log('Budget updated in the DB');
   }
 })
  
  res.redirect("/settings");
 
});
app.post("/checkbox",function(req,res){
  var id = req.body.checkbox;
  Expense.findOne({_id: id}, function(err, foundUser){
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.delete === false) {
          b1 = Number(b1)+Number(foundUser.cost);
          Expense.updateOne({_id:id},{delete:1},function(err){
            if(err){
                 console.log(err);
               }
            else{
                 console.log('All good!')
               }
             });
             User.updateOne({email:email},{budget:b1},function(err){
              if(err){
                   console.log(err);
                 }
              else{
                   console.log('All good!')
                 }
               });
               res.redirect('/dashboard');
        }
        else{
          b1 = Number(b1)-Number(foundUser.cost);
          Expense.updateOne({_id:id},{delete:false},function(err){
            if(err){
                 console.log(err);
               }
            else{
                 console.log('All good!')
               }
             });
          
          User.updateOne({email:email},{budget:b1},function(err){
            if(err){
                 console.log(err);
               }
            else{
                 console.log('All good!')
               }
             });
             res.redirect('/dashboard');
        }
      }
    }
  });
})
app.post("/expenditure",function(req,res){
  const radio=req.body.optradio;
  const item=req.body.item;
  const cost=Number(req.body.cost);
  b1=b1-cost;
  console.log(b1);
  User.updateOne({email:email},{budget:b1},function(err){ //upadating budget in the database
    if(err){
      console.log(err);
    }
    else{
      console.log('Budget updated in the DB');
    }
  }); 
  console.log(radio);
  console.log(item);
  console.log(cost);
  const newExpense= new Expense({
    email: email,
    category: radio,
    item: item,
    cost: cost,
    delete:0
  });
  newExpense.save(function(err){
    if(err)
    {
      console.log(err);
    }
    else{
      res.sendFile(__dirname+"/settings.html");
    }
  });

});
app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
