const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_API_KEY;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.postListing = async (req, res, next) => {
    let response = await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
    })
        .send();
    let url = req.file.path;
    let filename = req.file.filename;
    let newList = new Listing(req.body.listing);
    newList.owner = req.user._id;
    newList.image = { url, filename };
    newList.geometry = response.body.features[0].geometry
    let savedlisting = await newList.save();
    // console.log(savedlisting);
    req.flash("success", "New listing added");
    res.redirect("/listing");
}

module.exports.getIndexListing = async (req, res) => {
    let allListing = await Listing.find();
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = 3; // Number of listings per page
    const offset = (page - 1) * limit; // Offset for the current page
    const totalCount = await Listing.countDocuments(); // Total number of listings
    const totalPages = Math.ceil(totalCount / limit); // Total pages
    const lists = await Listing.find().skip(offset).limit(limit); // Fetch listings for current page
    res.render('listing/index.ejs', { lists, paginatedLists: lists, currentPage: page, totalPages });

    // res.render("listing/index.ejs", { lists: allListing });
}

module.exports.addnewListing = (req, res) => {
    res.render("listing/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    // const list = await Listing.findById(id)
    //     .populate({
    //         path: "reviews",
    //         populate: {
    //             path: "author",
    //         },
    //     })
    //     .populate("owner");
    const list = await Listing.findById(id)
    .populate({
        path: "reviews",
        options: { sort: { date: -1 } }, // Replace 'date' with the field you want to sort by
        populate: {
            path: "author",
        },
    })
    .populate("owner");
    // list.reverse();
    await Listing.updateOne({ _id: id }, { $inc: { views: 1 } });

    if (!list) {
        req.flash("error", "Requested listing do not exist.");
        res.redirect("/listing");
    }
    res.render("listing/show.ejs", { list });
}

module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if (!list) {
        req.flash("error", "Requested listing do not exist for deletion.");
        res.redirect("/listing");
    }
    let originalImage = list.image.url;
    originalImage.replace("/upload", "/upload/h_300,w_250");
    res.render("listing/edit.ejs", { list, originalImage });
}

module.exports.puteditListing = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }).catch((err) => {
        console.log(err);
    });
    if (typeof req.file != "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing edited");
    res.redirect(`/listing/${id}`);
}
module.exports.categorySearch = async (req, res) => {
    const { category } = req.params; // Get the category from the request parameters

    // Log the category to ensure it's captured correctly

    let results;

    // Check if the category is "trending"
    if (category === "trending") {
        // Query to find all listings sorted by views in descending order
        results = await Listing.find().sort({ views: -1 });
    } else {
        const regex = new RegExp(category, 'i'); // Case-insensitive search
        // Query to find all listings that match the specified category
        results = await Listing.find({ category: regex });
    }

    // Pagination logic (if applicable)
    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = 3; // Set your desired limit per page
    const total = results.length; // Total number of results
    const totalPages = Math.ceil(total / limit); // Calculate total pages
    const paginatedLists = results.slice((page - 1) * limit, page * limit); // Get results for current page

    // Render search results to the EJS template
    res.render('listing/index.ejs', {
        lists: paginatedLists,
        paginatedLists: paginatedLists,
        currentPage: page,
        totalPages: totalPages,
        category: category // Pass the category for user reference
    });
};

module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id).catch((err) => {
        console.log(err);
    });
    req.flash("success", "Listing deleted.");
    res.redirect("/listing");
}