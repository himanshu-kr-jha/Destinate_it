const mongoose=require("mongoose");
const Schema=mongoose.Schema;
const passportLocalMongoose=require("passport-local-mongoose");
const Listing = require("./listing.js");
const userSchema=new Schema({
    email:{
        type:String,
        required:true,
    },
    likes: [
        {
            type: Schema.Types.ObjectId,
            ref: "Listing", // The entity being liked
        },
    ],
});
userSchema.plugin(passportLocalMongoose);
module.exports=mongoose.model("User",userSchema);