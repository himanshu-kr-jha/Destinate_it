const express = require("express");
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { saveRedirectUrl } = require("../middleware.js");
const router = express.Router();
const userConroller=require("../controllers/user.js");

router.get("/signup",userConroller.sigup );

router.post("/signup",
    wrapAsync(userConroller.signupPost));

router.get("/login", (req, res) => {
    res.render("users/login.ejs")

});

router.post("/login", 
    saveRedirectUrl,
    passport.authenticate("local", {
    failureRedirect: "/user/login",
    failureFlash: true,
}),
    wrapAsync(userConroller.login));

router.get("/logout",userConroller.logout);

module.exports = router;