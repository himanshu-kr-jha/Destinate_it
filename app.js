const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const Listing = require("./models/listing.js");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema}=require("./Schema.js");   

app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public/js")));

const MONGOURL = "mongodb://127.0.0.1:27017/Madhuravas";
main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(MONGOURL);
}

app.engine("ejs", ejsMate);

app.get("/", (req, res) => {
    res.render("listing/home.ejs");
});

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        // Assuming ExpressError is properly defined or imported
        return next(new ExpressError(400, error.details.map(detail => detail.message).join(', ')));
    }
    next();
}

app.get("/listing", wrapAsync(async (req, res) => {
    let allListing = await Listing.find();
    res.render("listing/index.ejs", { lists: allListing });
}));

app.get("/listing/new", (req, res) => {
    res.render("listing/new.ejs");
});

// Show route
app.get("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    res.render("listing/show.ejs", { list });
}));

app.post("/listing/new",
    validateListing,
    wrapAsync(async (req, res, next) => {
    let newList = new Listing(req.body.listing);
    await newList.save();
    res.redirect("/listing");
}));

// Edit route
app.get("/listing/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    res.render("listing/edit.ejs", { list });
}));

// Update route
app.put("/listing/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }).catch((err) => {
        console.log(err);
    });
    res.redirect(`/listing/${id}`);
}));

// Delete route
app.delete("/listing/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id).catch((err) => {
        console.log(err);
    });
    res.redirect("/listing");
}));

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
