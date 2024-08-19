const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");

// routes
const Listings=require("./routes/listing.js");
const Reviews=require("./routes/reviews.js");

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

//home
app.get("/", (req, res) => {
    res.render("listing/home.ejs");
});

//listings
app.use("/listing",Listings);
// reviews.
app.use("/listing/:id/reviews",Reviews);

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
