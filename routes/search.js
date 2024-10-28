const express = require('express');
const router = express.Router();
const Destination = require('../models/listing'); // Adjust the path as necessary

// Search API
router.get('/search', async (req, res) => {
    try {
        const searchQuery = req.query.q || ''; // Get the search query from request
        const regex = new RegExp(searchQuery, 'i'); // Case-insensitive search

        // Search by title, location, or country
        const results = await Destination.find({
            $or: [
                { title: regex },
                { location: regex },
                { country: regex }
            ]
        });

        // Render search results to the EJS template
        res.render('listing/searchResults.ejs', {results, searchQuery });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
