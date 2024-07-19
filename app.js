const express= require("express");
const app = express();
const mongoose = require('mongoose');
const path=require("path");
const Listing =require("./models/listing.js");
const methodOverrider=require("method-override");
const ejsMate=require("ejs-mate");

app.use(methodOverrider("_method"));
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/public/js")));
const MONGOURL="mongodb://127.0.0.1:27017/Madhuravas"
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(MONGOURL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

app.engine("ejs",ejsMate);

app.get("/",(req,res)=>{
    // res.send("Starting the major project");
    res.render("listing/home.ejs")
});
app.get("/listing",async (req,res)=>{
    let allListing=await Listing.find();
    // console.log(lists);
    // res.send("new listing here.");
    res.render("listing/index.ejs",{lists:allListing});
});

app.get("/listing/new",(req,res)=>{
    res.render("listing/new.ejs");
});

//show route
app.get("/listing/:id",async (req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    res.render("listing/show.ejs",{list});
});

app.post("/listing/new", async (req, res) => {
    let newList = new Listing(req.body.listing);

    await newList.save()
        .then((result) => {
            // console.log("New listing created:", result);
            res.redirect("/listing");
        })
        .catch((err) => {
            console.error("Error creating new listing:", err);
            // Handle the error appropriately
            res.status(500).send("Error creating new listing");
        });
});

//edit route

app.get("/listing/:id/edit", async (req,res)=>{
    let {id}=req.params;
    const list= await Listing.findById(id);
    res.render("listing/edit.ejs",{list});
});

https://lh5.googleusercontent.com/p/AF1QipNdX9zvW1mcyYhTwlJYKRpzlNFTrJ1j1fGFH79N=w203-h114-k-no&quot

//update route
app.put("/listing/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndUpdate({_id:id},{...req.body.listing},{new:true}).then((res)=>{
        // console.log(res);
    }).catch((err)=>{
        console.log(err);
    });
    res.redirect(`/listing/${id}`);
});

app.delete("/listing/:id",async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete({_id:id}).then((res)=>{
        // console.log(res);
    });
    res.redirect("/listing");
});

app.listen(8080,(req,res)=>{
    console.log("server started.");
});