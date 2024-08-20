const express = require("express");
const router=express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const{isLogged,isOwner}=require("../middleware.js");
const{validateListing}=require("../middleware.js");
const listingConroller=require("../controllers/listing.js");
router.post("/new",
    validateListing,
    wrapAsync(listingConroller.postListing));

router.get("/", wrapAsync(listingConroller.getIndexListing));

router.get("/new", isLogged, listingConroller.addnewListing);

// Show route
router.get("/:id", wrapAsync(listingConroller.showListing));


// Edit route
router.get("/:id/edit", isLogged,isOwner, wrapAsync(listingConroller.editListing));

// Update route
router.put("/:id", 
    isLogged,
    isOwner,
    validateListing,
    wrapAsync(listingConroller.puteditListing));

// Delete route
router.delete("/:id",isLogged,
    isOwner,
     wrapAsync(listingConroller.destroyListing));

module.exports=router;
