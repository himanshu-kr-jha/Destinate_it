const express = require("express");
const router=express.Router();
const Listing = require("../models/listing.js");
const mapController=require("../controllers/map.js");


// Route to render map page
router.get('/', mapController.allPoints);

module.exports = router;
