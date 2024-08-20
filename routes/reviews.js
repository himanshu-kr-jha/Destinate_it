const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const{isLogged, isAuthor}=require("../middleware.js");
const{validateReview}=require("../middleware.js");
router.post("/", isLogged,
    validateReview,
    wrapAsync(async(req,res)=>{
        let id=req.params.id;
    let listings=await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    newReview.author=req.user._id;
    console.log(newReview);
    listings.reviews.push(newReview);
    await newReview.save();
    await listings.save();
    req.flash("success","Review Added.");
    res.redirect(`/listing/${id}`);
}));

router.delete("/:reviewId", isLogged,isAuthor,
    wrapAsync(async(req,res)=>{
        let {id,reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        req.flash("success","Review deleted.");
        res.redirect(`/listing/${id}`);
}));

module.exports=router;