const Joi = require('joi');
const { rawListeners } = require('./models/listing');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        coordinates: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().allow("", null),
        category: Joi.string().valid(
            "Homes", 
            "Restaurants", 
            "Nature", 
            "Wellness", 
            "Adventure", 
            "Art & Culture", 
            "Cafes", 
            "Gardens", 
            "Monuments", 
            "Historical Monument", 
            "Cultural Site", 
            "Modern Landmark", 
            "Natural Wonder", 
            "Other"
        ).required()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        comment: Joi.string().required(),
    }).required()
});
