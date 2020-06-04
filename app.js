    //jshint esversion:6
    require('dotenv').config();
    const express = require("express");
    const bodyParser = require("body-parser");
    const mongoose = require("mongoose");
    const ejs = require("ejs");
    const app = express();
    const session = require("express-session");
    const passport = require("passport");
    const passportLocalMongoose = require("passport-local-mongoose");
    // const encrypt = require("mongoose-encryption");
    // const md5 = require("md5");
    const saltRounds = 10;
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(express.static("public"));
    app.set("view engine","ejs");

    // console.log(process.env.API_KEY);
    // console.log(md5("123456"));

      app.use(session({
        secret :"Our little secret.",
        resave : false,
        saveUninitialized: false,

      }));

      app.use(passport.initialize());
      app.use(passport.session());

    mongoose.connect("mongodb://localhost:27017/userDatabase",{useNewUrlParser:true,useUnifiedTopology: true},function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Connected Successfully");
      }
    });

    mongoose.set('useCreateIndex', true);



    const userSchema = new mongoose.Schema({
      email    : String,
      password : String
    });

    // userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['password']});
    userSchema.plugin(passportLocalMongoose);


    const User = mongoose.model("User",userSchema);

    passport.use(User.createStrategy());

    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());

    app.get("/",function(req,res){
      res.render("home");
    });

    app.get("/login",function(req,res){
      res.render("login");
    });

    app.get("/register",function(req,res){
      res.render("register");
    });

    app.get("/secrets",function(req,res){
      if(req.isAuthenticated()){
        res.render("secrets");
      }else{
        res.redirect("/login");
      }
    });

    app.get("/logout",function(req,res){
      req.logout();
      res.redirect("/");
    })

    // post method for registeration of user
    app.post("/register",function(req,res){

        User.register({username:req.body.username},req.body.password,function(err,user){
          if(err){
            console.log(err);
            res.redirect("/register")
          }else{

              passport.authenticate("local")(req,res,function(){
                res.redirect("/login");
              })
          }
        })

    });

    // post method for login user
    app.post("/login",function(req,res){

        const newUser = new User({
          username : req.body.username,
          password : req.body.username
        });

        req.login(newUser,function(err){
          if(err){
            console.log(err);
          }else{
            passport.authenticate("local")(req,res,function(){
              res.redirect("/secrets");
            })
          }
        })

    });




    app.listen(3000,function(){
      console.log("server started successfully on port 3000");
    })
