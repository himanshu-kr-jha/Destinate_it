const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_API_KEY;
const geocodingClient = mbxGeocoding({ accessToken:mapToken});
module.exports.postListing=async (req, res, next) => {
    let response=await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 1
      })
        .send();
    let url=req.file.path;
    let filename=req.file.filename;
    let newList = new Listing(req.body.listing);
    newList.owner=req.user._id;
    newList.image={url,filename};
    newList.geometry=response.body.features[0].geometry
    let savedlisting=await newList.save();
    console.log(savedlisting);
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
    console.log("Listing id:"+list._id);
    console.log(req.user);
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
    let originalImage=list.image.url;
    originalImage.replace("/upload","/upload/h_300,w_250");
    res.render("listing/edit.ejs", { list,originalImage });
}

module.exports.puteditListing=async (req, res) => {
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true }).catch((err) => {
        console.log(err);
    });
    if(typeof req.file !="undefined"){
        let url=req.file.path;
        let filename=req.file.filename;
        listing.image={url,filename};
        await listing.save();    
    }

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