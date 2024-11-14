const express = require("express");
const router=express.Router({mergeParams:true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const{isLogged, isAuthor}=require("../middleware.js");
const{validateReview}=require("../middleware.js");
const reviewsConroller=require("../controllers/reviews.js");
router.post("/", isLogged,
    validateReview,
    wrapAsync(reviewsConroller.postReview));

router.delete("/:reviewId", isLogged,isAuthor,
    wrapAsync(reviewsConroller.destroyReview));

module.exports=router;