const express = require("express");
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const router = express.Router();

router.get("/signup", (req, res) => {
    res.render("../views/users/signup.ejs");
});

router.post("/signup",
    wrapAsync(async (req, res) => {
        try {
            let { username, email, password } = req.body;
            let newUser = new User({ username, email });
            const registeredUser = await User.register(newUser, password);
            req.login(registeredUser,(err)=>{
                if(err){
                    next(err);
                }
                req.flash("success","Welcome to Madhuravas.");
                res.redirect("/listing");
            })
            // req.flash("success", "new user registered");
        } catch (e) {
            req.flash("error", e.message);
            res.redirect("/user/signup");
        }
    }));

router.get("/login", (req, res) => {
    res.render("users/login.ejs")

});

router.post("/login", 
    saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
}),
    wrapAsync(async (req, res) => {
        req.flash("success","Welcome back to Madhuravas");
        let redirecturl=res.locals.redirectUrl || "/listing";
        res.redirect(redirecturl);
}));

router.get("/logout",(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged you out");
        res.redirect("/listing");
    })
})

module.exports = router;