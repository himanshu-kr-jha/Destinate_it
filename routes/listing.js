const express = require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const {listingSchema}=require("../Schema.js");  

const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        // Assuming ExpressError is properly defined or imported
        return next(new ExpressError(400, error.details.map(detail => detail.message).join(', ')));
    }
    next();
}

router.get("/", wrapAsync(async (req, res) => {
    let allListing = await Listing.find();
    res.render("listing/index.ejs", { lists: allListing });
}));

router.get("/listing/new", (req, res) => {
    res.render("listing/new.ejs");
});

// Show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id).populate("reviews");
    res.render("listing/show.ejs", { list });
}));

router.post("/new",
    validateListing,
    wrapAsync(async (req, res, next) => {
    let newList = new Listing(req.body.listing);
    await newList.save();
    res.redirect("/listing");
}));

// Edit route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    res.render("listing/edit.ejs", { list });
}));

// Update route
router.put("/:id", 
    validateListing,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }).catch((err) => {
        console.log(err);
    });
    res.redirect(`/listing/${id}`);
}));

// Delete route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id).catch((err) => {
        console.log(err);
    });
    res.redirect("/listing");
}));

module.exports=router;
