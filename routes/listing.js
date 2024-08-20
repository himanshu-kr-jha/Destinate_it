const express = require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{isLogged,isOwner}=require("../middleware.js");
const{validateListing}=require("../middleware.js");

router.post("/new",
    validateListing,
    wrapAsync(async (req, res, next) => {
    let newList = new Listing(req.body.listing);
    newList.owner=req.user._id;
    await newList.save();
    req.flash("success","New listing added");
    res.redirect("/listing");
}));

router.get("/", wrapAsync(async (req, res) => {
    let allListing = await Listing.find();
    res.render("listing/index.ejs", { lists: allListing });
}));

router.get("/new", isLogged, (req, res) => {
    res.render("listing/new.ejs");
});

// Show route
router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    console.log(list);
    if(!list){
        req.flash("error","Requested listing do not exist.");
        res.redirect("/listing");
    }
    res.render("listing/show.ejs", { list });
}));


// Edit route
router.get("/:id/edit", isLogged,isOwner, wrapAsync(async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if(!list){
        req.flash("error","Requested listing do not exist for deletion.");
        res.redirect("/listing");
    }
    res.render("listing/edit.ejs", { list });
}));

// Update route
router.put("/:id", 
    isLogged,
    isOwner,
    validateListing,
    wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }).catch((err) => {
        console.log(err);
    });
    req.flash("success","Listing edited");
    res.redirect(`/listing/${id}`);
}));

// Delete route
router.delete("/:id",isLogged,
    isOwner,
     wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id).catch((err) => {
        console.log(err);
    });
    req.flash("success","Listing deleted.");
    res.redirect("/listing");
}));

module.exports=router;
