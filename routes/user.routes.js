const express = require('express');
const router = express.Router();

const bcrypt = require("bcryptjs");
const saltRounds = 10;

const User = require("../models/User.model");

const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.get("/signin", isLoggedOut, (req, res, next) => {
    res.render("users/signin");

});

router.post("/signin",  isLoggedOut, (req, res, next) => {
    
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

router.get("/login", isLoggedOut, (req, res, next) => {
    res.render("users/login");
});

router.post("/login", isLoggedOut, (req, res, next) => {
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
            res.redirect("/user/private");
        } else {
            res.render("users/login")
        }
    })
    .catch (err => next(err))
})

router.get("/private", isLoggedIn, (req, res, next) => {
    res.render("users/private", {username: req.session.currentUser});

});

router.get("/main", isLoggedOut, (req, res, next) => {
    res.render("users/main", {username: req.session.currentUser});

});

router.get("/logout", isLoggedIn, (req, res, next) => {
    req.session.destroy(err => {
        if(err) next(err);
        else res.redirect("/user/login")
    })
})


module.exports = router;