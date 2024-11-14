if(process.env.NODE_ENV!="production"){
    require('dotenv').config()
}
const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo');
const flash=require("connect-flash");
const passport=require("passport");
const localStrat=require("passport-local");
const User=require("./models/user.js");

// routes
const ListingsRouter=require("./routes/listing.js");
const ReviewsRouter=require("./routes/reviews.js");
const UserRouter=require("./routes/user.js");
const searchRouter = require('./routes/search'); // Adjust the path as necessary
const mapRouter=require("./routes/map.js");

// Set up EJS as the template engine
// const dburl = "mongodb://127.0.0.1:27017/Madhuravas";
const dburl=process.env.ATLAS_DB_URL;
const store=MongoStore.create({
    mongoUrl:dburl,
    crypto:{
        secret:process.env.SECRET
    },
    touchAfter:24*3600,
});

store.on("error",()=>{
    console.log("Error in MONGO SESSION STORE");
});
const sessionOptions={
    store,
    secret:process.env.SECRET,
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

main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(dburl);
}

app.get("/", (req, res) => {
    res.render("listing/home.ejs");
});

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

//listings
app.use("/listing",ListingsRouter);
app.use("/listing/category/trending",(req,res)=>{
    
})
// reviews.
app.use("/listing/:id/reviews",ReviewsRouter);

//search

// app.use("/listing/")
//user
app.use("/user",UserRouter);
app.get("/privacy",(req,res)=>{
    res.render("listing/privacy.ejs");
})
app.get("/terms",(req,res)=>{
    res.render("listing/terms.ejs");
})
//search

app.use('/', searchRouter);
app.use('/map',mapRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page not found!!", 404));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = 'Something went wrong !! ' } = err;
    console.error(err.stack);
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send({ error: message });
});


app.listen(8000, () => {
    console.log("server started.");
});
