const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); 
const {reviewSchema}=require("../Schema.js");  
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // Assuming ExpressError is properly defined or imported
        return next(new ExpressError(400, error.details.map(detail => detail.message).join(', ')));
    }
    next();
}

router.post("/",
    validateReview,
    wrapAsync(async(req,res)=>{
        let id=req.params.id;
    let listings=await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    listings.reviews.push(newReview);
    await newReview.save();
    await listings.save();
    res.redirect(`/listing/${id}`);
}));

router.delete("/:reviewId",
    wrapAsync(async(req,res)=>{
        let {id,reviewId}=req.params;
        await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/listing/${id}`);
}));

module.exports=router;