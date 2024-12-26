const mongoose = require("mongoose");
const visitSchema = new mongoose.Schema({
    url: { type: String, required: true },
    method: { type: String, required: true },
    duration: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
});

module.exports= mongoose.model('Visit', visitSchema);
