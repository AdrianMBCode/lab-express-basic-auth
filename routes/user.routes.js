const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User.model");

router.get("/signin", (req, res, next) => {
    res.render("users/signin");

});

router.post("/signin", (req, res, next) => {
    
    let {username, password, repeatPassword} = req.body;

    if (username == "" || password == "" || repeatPassword == ""){
        res.render("users/signin");
        return;
    }
    else if (password != repeatPassword){
        res.render("users/signin");
        return;
    } 
    
    User.find({username})
    .then(results => {
        if(results.length != 0){
            res.render("users/signin");
            return;
        }
        let salt = bcrypt.genSaltSync(saltRounds)
        let passwordCrypt = bcrypt.hashSync(password, salt)

    User.create({
            username: username,
            password: passwordCrypt
        })
        .then(result => {
            console.log("HOLAAAAAA")
            console.log(result);
            res.redirect ("/user/login");
        })
        .catch (err => next(err));
    })
    .catch (err => next(err));

});

router.get("/login", (req, res, next) => {
    res.render("users/login");
});

router.post("/login", (req, res, next) => {
    let {username, password} = req.body;
    if (username == "" || password == ""){
        res.render("users/login")
        return;
    }
    User.find({username})
    .then(results => {
        if(results.length == 0) {
            res.render("users/login");
            return;
        }
        if(bcrypt.compare(password, results[0].password)){
            req.session.currentUser = username;
            console.log(req.session.currentUser)
            res.redirect("/user/profile");
        } else {
            res.render("users/login")
        }
    })
    .catch (err => next(err))
})

router.get("/profile", (req, res, next) => {
    res.render("users/profile", {username: req.session.currentUser});

});


module.exports = router;