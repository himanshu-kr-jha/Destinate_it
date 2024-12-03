const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const User = require("../models/user.js");
const { isLogged, isOwner } = require("../middleware.js");
const listingConroller=require("../controllers/listing.js")
router.post("/:id/liked",
    wrapAsync(listingConroller.likelisting));

module.exports = router;
