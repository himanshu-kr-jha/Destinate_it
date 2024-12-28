const User = require("../models/user.js");
const Listing =require("../models/listing.js");
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
            req.flash("success","Welcome to Destinate !t.");
            res.redirect("/listing");
        })
        // req.flash("success", "new user registered");
    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/user/signup");
    }
}

module.exports.login=async (req, res) => {
    req.flash("success","Welcome back to Destinate !t");
    console.log("logged in");
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

module.exports.profile = async (req, res) => {
    const { id } = req.params;

    try {
        // Validate the id parameter
        // if (!mongoose.Types.ObjectId.isValid(id)) {
        //     return res.status(400).send('Invalid User ID');
        // }

        // Find the user by ID
        const user = await User.findById(id).populate('likes');
        const listing =await Listing.find({owner:id});
        console.log(user._id);
        // Handle case where user is not found
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Render the profile page with the user data
        res.render("../views/users/profile.ejs", { user,listing });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).send('Internal Server Error');
    }
};