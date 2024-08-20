const Listing = require("../models/listing.js");

module.exports.postListing=async (req, res, next) => {
    let newList = new Listing(req.body.listing);
    newList.owner=req.user._id;
    await newList.save();
    req.flash("success","New listing added");
    res.redirect("/listing");
}

module.exports.getIndexListing=async (req, res) => {
    let allListing = await Listing.find();
    res.render("listing/index.ejs", { lists: allListing });
}

module.exports.addnewListing=(req, res) => {
    res.render("listing/new.ejs");
}

module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id)
    .populate({
        path:"reviews",
        populate:{
            path:"author",
        },
    })
    .populate("owner");
    console.log(list);
    if(!list){
        req.flash("error","Requested listing do not exist.");
        res.redirect("/listing");
    }
    res.render("listing/show.ejs", { list });
}

module.exports.editListing=async (req, res) => {
    let { id } = req.params;
    const list = await Listing.findById(id);
    if(!list){
        req.flash("error","Requested listing do not exist for deletion.");
        res.redirect("/listing");
    }
    res.render("listing/edit.ejs", { list });
}

module.exports.puteditListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }).catch((err) => {
        console.log(err);
    });
    req.flash("success","Listing edited");
    res.redirect(`/listing/${id}`);
}

module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id).catch((err) => {
        console.log(err);
    });
    req.flash("success","Listing deleted.");
    res.redirect("/listing");
}