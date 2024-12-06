const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const review = require("../models/review.js");
const User = require("../models/user.js");
const mapToken = process.env.MAP_API_KEY;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });
module.exports.postListing = async (req, res, next) => {
    try {
        // Handle multiple uploaded files
        const images = req.files.map(file => ({
            url: file.path,
            filename: file.filename
        }));

        // Check if coordinates are provided
        const coordinates = req.body.listing.coordinates;
        if (coordinates) {
            // Split the coordinates if they are in "lat, lng" format
            const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));

            // Ensure lat and lng are valid numbers
            if (!isNaN(lat) && !isNaN(lng)) {
                req.body.listing.geometry = { type: 'Point', coordinates: [lng, lat] };
            } else {
                req.flash("error", "Invalid coordinates format.");
                return res.redirect("/listing/new");
            }
        } else {
            // Handle missing coordinates
            req.flash("error", "Coordinates are required.");
            return res.redirect("/listing/new");
        }

        // Create a new listing object
        const newList = new Listing({
            ...req.body.listing,
            images, // Assign the array of images
            owner: req.user._id
        });

        // Save the listing
        const savedListing = await newList.save();

        // Set success flash message and redirect
        req.flash("success", "New listing added.");
        res.redirect("/listing");
    } catch (err) {
        console.error(err);
        req.flash("error", "Something went wrong while adding the listing.");
        res.redirect("/listing/new");
    }
};


module.exports.getIndexListing = async (req, res) => {
    // let allListing = await Listing.find();
    const currUser = req.session.userId; // Replace with your current user logic

    const page = parseInt(req.query.page) || 1; // Current page number
    const limit = 3; // Number of listings per page
    const offset = (page - 1) * limit; // Offset for the current page
    const totalCount = await Listing.countDocuments(); // Total number of listings
    const totalPages = Math.ceil(totalCount / limit); // Total pages
    const lists = await Listing.find().sort({ views:-1,createdAt:-1 })
    .skip(offset).limit(limit); // Fetch listings for current page
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
    let coordinates = req.body.listing.coordinates;
    if (coordinates) {
        // Split the coordinates if they are in "lat, lng" format
        let [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
        
        // Ensure lat and lng are valid numbers
        if (!isNaN(lat) && !isNaN(lng)) {
            req.body.listing.geometry = { type: 'Point', coordinates: [lng, lat] };
        } else {
            req.flash("error", "Invalid coordinates format.");
            return res.redirect("/listing/new");
        }
    } else {
        // If no coordinates provided, you could add a fallback or handle accordingly
        req.flash("error", "Coordinates are required.");
        return res.redirect("/listing/new");
    }
    const listing = await Listing.findByIdAndUpdate(id, { 
        ...req.body.listing, 
        geometry: req.body.listing.geometry // Explicitly update geometry
    }, { new: true }).catch((err) => {
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

module.exports.likelisting = async (req, res) => {
    if (!req.user) {
    req.flash("error", "You must be logged in to like items.");
    return res.redirect("/user/login");
  }
    let userId= req.user._id;
    let listingId=req.params.id
    try {
        // Find the user in the database
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Find the listing in the database
        const listing = await Listing.findById(listingId);

        if (!listing) {
            return res.status(404).json({ success: false, message: 'Listing not found' });
        }

        // Update the user's liked listings
            // If liked, add the listing to the user's liked listings
            if (!user.likes.includes(listingId)) {
                // Add to likes if not already liked
                user.likes.push(listingId);
                listing.likes.push(userId);
                await user.save();
                await listing.save();
                // console.log("Like added successfully");
              } else {
                // If already liked, remove the like
                user.likes = user.likes.filter(id => id.toString() !== listingId.toString());
                listing.likes = listing.likes.filter(id => id.toString() !== userId.toString());
              
                await Promise.all([user.save(), listing.save()]); // Save both updates concurrently
                // console.log("Like removed successfully");
              }
              
        const referer = req.get('Referer');
        res.redirect(referer);
        
    } catch (error) {
        console.error(error);
        // res.status(500).json({ success: false, message: 'Server error' });
    }
};