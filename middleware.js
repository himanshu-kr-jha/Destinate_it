const Listing=require("./models/listing.js");
const Review=require("./models/review.js");
const {reviewSchema}=require("./Schema.js");  
const {listingSchema}=require("./Schema.js");  
module.exports.isLogged=(req,res,next)=>{
    if(!req.isAuthenticated()){
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in !!");
        return res.redirect("/user/login");
    }
    next();
};

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let {id}=req.params;
    let listing= await Listing.findById(id);
    console.log("owner"+listing.owner);
    console.log("locals"+res.locals.currUser._id);
    if(!listing.owner.equals(res.locals.currUser._id)){
        req.flash("error","You do not have permission.");
        return res.redirect(`/listing/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    if (error) {
        // Assuming ExpressError is properly defined or imported
        return next(new ExpressError(400, error.details.map(detail => detail.message).join(', ')));
    }
    next();
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        // Assuming ExpressError is properly defined or imported
        return next(new ExpressError(400, error.details.map(detail => detail.message).join(', ')));
    }
    next();
}

module.exports.isAuthor=async (req,res,next)=>{
    let {id,reviewId}=req.params;
    let review= await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
        req.flash("error","You haven't posted this review");
        return res.redirect(`/listing/${id}`);
    }
    next();
}
