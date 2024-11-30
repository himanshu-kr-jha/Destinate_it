const Listing = require("../models/listing.js");
// const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_API_KEY;
// const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.allPoints = async (req, res) => {
    try {
        // Fetch all listings with necessary fields
        const listings = await Listing.find({}, '_id title description geometry image');

        // Render the map template with listings data
        res.render("listing/map.ejs", { listings });
    } catch (error) {
        console.error("Error fetching listings:", error);
        res.status(500).send("An error occurred while fetching points.");
    }
};