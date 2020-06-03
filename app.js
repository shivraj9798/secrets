    //jshint esversion:6
    require('dotenv').config();
    const express = require("express");
    const bodyParser = require("body-parser");
    const mongoose = require("mongoose");
    const ejs = require("ejs");
    const app = express();
    const encrypt = require("mongoose-encryption");
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static("public"));
    app.set("view engine","ejs");

    console.log(process.env.API_KEY);

    mongoose.connect("mongodb://localhost:27017/userDatabase",{useNewUrlParser:true},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Connected Successfully");
      }
    });

    const userSchema = new mongoose.Schema({
      email    : String,
      password : String
    });

    userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['password']});



    const User = mongoose.model("User",userSchema);

    app.get("/",function(req,res){
      res.render("home");
    });

    app.get("/login",function(req,res){
      res.render("login");
    });

    app.get("/register",function(req,res){
      res.render("register");
    });

    app.post("/register",function(req,res){

          const newUser = new User({
            email    : req.body.username,
            password : req.body.password
          });

          newUser.save(function(err){
            if(err){
              console.log(err);
            }else{
              console.log("User Added Successfully");
              res.render("secrets");
            }
          });
    });


    app.post("/login",function(req,res){

        const username = req.body.username;
        const password = req.body.password;

        User.findOne({email:username},function(err,foundUser){{
          if(err){
            console.log(err);
          }else{
            if(foundUser.password === password){
              res.render("secrets");
            }
          }
        }});
    });




    app.listen(3000,function(){
      console.log("server started successfully on port 3000");
    })
