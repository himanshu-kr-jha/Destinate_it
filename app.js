const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const flash=require("connect-flash");
const passport=require("passport");
const localStrat=require("passport-local");
const User=require("./models/user.js");

// routes
const ListingsRouter=require("./routes/listing.js");
const ReviewsRouter=require("./routes/reviews.js");
const UserRouter=require("./routes/user.js");

const sessionOptions={
    secret:"jha@2023",
    resave:false,
    saveUninialized:true,
    cookie:{
        expires:Date.now()+7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    },
};
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public/js")));
app.engine("ejs", ejsMate);

const MONGOURL = "mongodb://127.0.0.1:27017/Madhuravas";
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(MONGOURL);
}

// app.get("/", (req, res) => {
//     res.render("listing/home.ejs");
// });

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    res.locals.currUser=req.user;
    next();
});

app.get("/demouser",async(req,res)=>{
    let fakeuser=new User({
        email: "himanshukrjha004@gmail.com",
        username:"himanshu"
    });

    let newuser=await User.register(fakeuser,"1234");
    res.send(newuser);
});
//listings
app.use("/listing",ListingsRouter);
// reviews.
app.use("/listing/:id/reviews",ReviewsRouter);
//user
app.use("/user",UserRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found!!", 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong !! ' } = err;
    console.error(err.stack);
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send({ error: message });
});

app.listen(8080, () => {
    console.log("server started.");
});
