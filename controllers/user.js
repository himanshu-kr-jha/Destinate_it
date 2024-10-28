const User = require("../models/user.js");
module.exports.sigup=(req, res) => {
    res.render("../views/users/signup.ejs");
}
module.exports.signupPost=async (req, res) => {
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
}

module.exports.login=async (req, res) => {
    req.flash("success","Welcome back to Madhuravas");
    let redirecturl=res.locals.redirectUrl || "/listing";
    res.redirect(redirecturl);
}

module.exports.logout=(req,res)=>{
    req.logout((err)=>{
        if(err){
            return next(err);
        }
        req.flash("success","logged you out");
        res.redirect("/listing");
    })
}